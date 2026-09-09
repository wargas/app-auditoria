import { Grid } from '#components/grid';
import { Button } from '#components/ui/button';
import Editor, { Monaco, OnMount, useMonaco } from '@monaco-editor/react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useApp } from '../app-context';
import _, { filter, uniqBy } from 'lodash'
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '#components/ui/resizable';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuAction, SidebarMenuButton, SidebarMenuItem, SidebarMenuSub, SidebarMenuSubButton, SidebarMenuSubItem, SidebarProvider } from '#components/ui/sidebar';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '#components/ui/collapsible';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Spinner } from '#components/ui/spinner';
import { save } from '@tauri-apps/plugin-dialog';
import { create } from '@tauri-apps/plugin-fs';
import { Input } from '#components/ui/input';
import { editor, KeyMod, KeyCode } from 'monaco-editor';
import { Store } from '@tauri-apps/plugin-store';
import { readText } from '@tauri-apps/plugin-clipboard-manager'
import { parse, show } from 'sql-parser-cst'



export function Component() {
    const app = useApp()
    const db = app.db!
    const [message, setMessage] = useState('')
    const [page, setPage] = useState(1)

    const monaco = useMonaco()

    const [searchTable, setSearchTable] = useState('')

    const editorRef = useRef<editor.IStandaloneCodeEditor>(null)

    const queryResult = useQuery({
        queryKey: ['query-result', page],
        queryFn: async () => {
            try {

                const timeStart = new Date().getTime()
                const sqlText = editorRef.current?.getValue() || ""

                const cst = parse(sqlText, {
                    dialect: 'sqlite',
                    includeComments: false,
                    includeSpaces: true,
                    includeNewlines: true
                })

                const executeStmts = cst.statements.filter(c => c.type != 'select_stmt' && c.type != 'empty')

                for await (const stmt of executeStmts) {
                    const sql = show(stmt).trim();

                    const queryExecute = await db.execute(sql);

                    setMessage(`${queryExecute.rowsAffected} linhas afetas`)

                }

                queryTables.refetch()

                const selectStmt = cst.statements.find(c => c.type == 'select_stmt')


                if (!selectStmt) return { result: [], count: 0 }

                const select = show(selectStmt).trim()

                const limit = 100;
                const offset = (page - 1) * limit

                const queryWrap = `select * from (${select})  limit ${offset}, ${limit}`

                const query = await db.select<any[]>(queryWrap)

                const sqlCount = `select count(*) as c from (${select})`

                const queryCount = await db.select(sqlCount)

                const count = _.get(queryCount, '0.c')

                const endTime = new Date().getTime()

                setMessage(`${count} linhas em ${endTime - timeStart} ms`)

                return {
                    count, result: query.map((q, i) => ({ '#': i + 1, ...q }))
                }
                // setResult(query.map((q, i) => ({ '#': i + 1, ...q })))
            } catch (e) {
                setMessage(String(e))
                return { result: [], count: 0 }
            }
        },
        enabled: !!editorRef.current?.getValue()
    })

    async function selectFileExport() {
        const res = await save({
            filters: [
                {
                    name: 'csv', extensions: ['csv']
                }
            ]
        })

        if (!res) return;

        mutationExportCSV.mutate(res)
    }

    const mutationExportCSV = useMutation({
        mutationFn: async (path: string) => {
            try {
                const sql = editorRef.current?.getValue() || ''
                const rows = await db.select<any[]>(sql)

                if (rows.length == 0) return;

                const cols = Object.keys(rows[0])

                const fileHandle = await create(path)

                await fileHandle.write(new TextEncoder().encode(cols.join(";")))

                for await (const row of rows) {
                    await fileHandle.write(new TextEncoder().encode("\n" + Object.values(row).join(";")))
                    setMessage(`Salvando ${rows.indexOf(row)} de ${rows.length}`)
                }

                setMessage(`Arquivo salvo com sucesso`)

                await fileHandle.close()
            } catch (error) {
                console.log(error)
            }
        }
    })

    const queryTables = useQuery({
        queryKey: ['tables'],
        queryFn: async () => {
            const query = await db.select<any[]>(`select 
                m.name as table_name,
                p.name as column_name,
                p.type,
                p.cid
                from sqlite_schema m
                join pragma_table_info(m.name) p`)


            return uniqBy(query, 'table_name').map(item => {
                return {
                    name: item.table_name,
                    columns: filter(query, { table_name: item.table_name })
                }
            })
        }
    })

    const columns = useMemo(() => {

        const result = queryResult.data?.result || []
        if (result.length == 0) return []


        const cols = Object.keys(result[0]).map(k => {
            return { field: k, headerName: k.toUpperCase() }
        }).map(c => {

            if (c.field == '#') {
                return { ...c, width: 100 }
            }

            return c
        })

        return cols
    }, [queryResult.data])


    function setTable(table: string) {
        editorRef.current?.setValue(`select * from ${table}`)
        queryResult.refetch()
    }


    const onMountEditor: OnMount = (editor, _monaco: Monaco) => {
        editorRef.current = editor

        editor.updateOptions({
            fontSize: 16
        })

        editor.addAction({
            id: 'custom-paste',
            label: 'paste',
            keybindings: [KeyMod.CtrlCmd | KeyCode.KeyV],
            run: async (ed) => {
                const text = await readText()
                const selection = await ed.getSelection()!

                ed.executeEdits('custom-paste', [{ range: selection, text, forceMoveMarkers: true }]);


            }
        });



    }

    async function handleChangeEditor(value: string | undefined, _ev: editor.IModelContentChangedEvent) {
        const store = await Store.load('editor.json')

        await store.set('code', value)
    }

    useEffect(() => {
        if (monaco) {
            monaco.languages.registerCompletionItemProvider('sql', {
                provideCompletionItems(model, position, _context, _token) {

                    const word = model.getWordUntilPosition(position)

                    const suggestionsTables = queryTables.data?.map(t => {
                        return {
                            label: t.name!,
                            kind: monaco.languages.CompletionItemKind.Keyword,
                            insertText: t.name!,
                            documentation: `table ${t.name}`,
                            range: {
                                startLineNumber: position.lineNumber,
                                endLineNumber: position.lineNumber,
                                startColumn: word.startColumn,
                                endColumn: word.endColumn
                            }
                        }
                    }) || []


                    return { suggestions: suggestionsTables };
                },


            });

            monaco.languages.registerCompletionItemProvider('sql', {
                triggerCharacters: ['.'],
                provideCompletionItems(model, position, _context, _token) {

                    const word = model.getWordUntilPosition(position)

                    const line = model.getLineContent(position.lineNumber).substring(0, word.endColumn);

                    const tableName = _.last(line.trim().split(' '))?.replace(/.$/, "")
                    

                    if (!tableName) return { suggestions: [] }


                    const suggestionsTables = queryTables.data?.filter(t => String(t.name).toLocaleLowerCase() == tableName.toLocaleLowerCase()).flatMap(t => {
                        return t.columns.map(c => {

                            return {
                                label: c.column_name!,
                                kind: monaco.languages.CompletionItemKind.Keyword,
                                insertText: String(c.column_name),
                                documentation: `table ${c.column_name}`,
                                range: {
                                    startLineNumber: position.lineNumber,
                                    endLineNumber: position.lineNumber,
                                    startColumn: word.startColumn,
                                    endColumn: word.endColumn
                                }
                            }
                        })
                    }) || []


                    return { suggestions: suggestionsTables };
                },


            });
        }
    }, [monaco, queryTables.data])



    const handleClickColumn = useCallback((table: string, col: string) => {
        if(!editorRef.current) return;

        const position = editorRef.current.getPosition()

        if(!position) return;

        const code = editorRef.current.getValue()

        const keyword = ` ${table}.${col} `

        let column = 0

        const newCode = code.split('\n').map((line, n) => {

            if(position.lineNumber == n+1) {
                const start = line.substring(0, position.column).trimEnd()+keyword

                
                column = start.length;
                return start+line.substring(position.column).trimStart()
            }

            return line
        })

        editorRef.current.setValue(newCode.join('\n'))
        editorRef.current.setPosition({column, lineNumber: position.lineNumber})

        editorRef.current.focus()

    }, [editorRef.current])

    return <SidebarProvider>
        <Sidebar>
            <SidebarContent>

                <SidebarGroup>
                    <SidebarGroupLabel>Tabelas</SidebarGroupLabel>

                    <SidebarMenu>
                        <SidebarMenuItem>
                            <Input value={searchTable} onChange={e => setSearchTable(e.target.value)} />
                        </SidebarMenuItem>
                        {queryTables.data?.map(item => (
                            <Collapsible asChild key={item.name} className='data-open:bg-muted group'>
                                <SidebarMenuItem >
                                    <SidebarMenuButton
                                    // 
                                    >
                                        <CollapsibleTrigger asChild>
                                            <Button variant={'ghost'} size={'icon'}>
                                                <ChevronRight className='group-data-open:rotate-90' />
                                            </Button>
                                        </CollapsibleTrigger>
                                        <span className='w-full' onClick={() => setTable(item.name)}>

                                            {item.name}
                                        </span>
                                    </SidebarMenuButton>
                                    <CollapsibleContent asChild>
                                        <SidebarMenuSub>
                                            {item.columns.filter(col => String(col.column_name).toLocaleLowerCase().includes(searchTable.toLocaleLowerCase())).map(col => (
                                                <SidebarMenuSubItem key={col.cid}>
                                                    <SidebarMenuSubButton onClick={() => handleClickColumn(item.name, col.column_name)}>
                                                        {col.column_name}
                                                        <SidebarMenuAction className='text-xs text-gray-400'>{col.type}</SidebarMenuAction>
                                                    </SidebarMenuSubButton>
                                                </SidebarMenuSubItem>
                                            ))}
                                        </SidebarMenuSub>
                                    </CollapsibleContent>
                                </SidebarMenuItem>
                            </Collapsible>
                        ))}
                    </SidebarMenu>

                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
        <div className='h-screen overflow-hidden flex flex-col relative w-full'>
            <ResizablePanelGroup orientation='vertical'>
                <ResizablePanel defaultSize={'50%'} className='relative'>
                    <div className='absolute top-0 right-0 left-0 bottom-10'>
                        <Editor
                            options={{ automaticLayout: true, minimap: { enabled: false } }}
                            onChange={handleChangeEditor}
                            onMount={onMountEditor}
                            language='sql'
                            height={`100%`} />
                    </div>
                    <div className='absolute right-0 border-t left-0 h-10 bottom-0 flex justify-end items-center px-2'>
                        <Button onClick={() => queryResult.refetch()} variant={'outline'}>
                            {queryResult.isFetching && (<Spinner />)}
                            Executar</Button>
                    </div>
                </ResizablePanel>
                <ResizableHandle withHandle />
                <ResizablePanel defaultSize={'50%'} className='relative'>
                    <div className='absolute top-0 right-0 left-0 bottom-0'>
                        <Grid
                            // onSortChanged={handleChangeSort} 
                            columnDefs={columns} autoGenerateColumnDefs={false} rowData={queryResult.data?.result || []} />
                    </div>
                    <div className='absolute border-t px-4 right-0 left-0 h-12 border bottom-0 flex items-center'>
                        <span className='text-sm'>

                            {message}
                        </span>
                        <div className='flex mx-auto'>
                            <Button variant={'ghost'} onClick={() => setPage(p => Math.max(1, p - 1))}>
                                <ChevronLeft />
                            </Button>
                            <div className='w-20'>
                                <Input value={page} onChange={t => setPage(parseInt(t.target.value))} className='text-center' />
                            </div>
                            <Button variant={'ghost'} onClick={() => setPage(p => p + 1)}>
                                <ChevronRight />
                            </Button>
                        </div>
                        <Button onClick={() => selectFileExport()} variant={'outline'}>
                            {mutationExportCSV.isPending && (
                                <Spinner />
                            )}
                            Exportar CSV</Button>
                    </div>
                </ResizablePanel>
            </ResizablePanelGroup>
        </div>
    </SidebarProvider>


}