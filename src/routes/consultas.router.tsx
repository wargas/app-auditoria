import { Grid } from '#components/grid';
import { Button } from '#components/ui/button';
import Editor from '@monaco-editor/react';
import { useCallback, useMemo, useState } from 'react';
import { useApp } from '../app-context';
import _, { filter, uniqBy } from 'lodash'
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '#components/ui/resizable';
import { useMutation, useQuery } from '@tanstack/react-query';
import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuAction, SidebarMenuButton, SidebarMenuItem, SidebarMenuSub, SidebarMenuSubButton, SidebarMenuSubItem } from '#components/ui/sidebar';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '#components/ui/collapsible';
import { ChevronRight } from 'lucide-react';
import { Spinner } from '#components/ui/spinner';
import { save } from '@tauri-apps/plugin-dialog';
import { create } from '@tauri-apps/plugin-fs';

export function Component() {
    const app = useApp()
    const db = app.db!
    const [sql, setSql] = useState('')
    const [result, setResult] = useState<any[]>([])
    const [message, setMessage] = useState('')

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
                const rows = await db.select<any[]>(sql)

                if(rows.length == 0) return;

                const cols = Object.keys(rows[0])

                const fileHandle = await create(path)

                await fileHandle.write(new TextEncoder().encode(cols.join(";")))

                for await (const row of rows) {
                    await fileHandle.write(new TextEncoder().encode("\n"+Object.values(row).join(";")))
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
        if (result.length == 0) return []


        const cols = Object.keys(result[0]).map(k => {
            return { field: k, headerName: k.toUpperCase() }
        }).map(c => {

            if (c.field == '#') {
                return { ...c, width: 50 }
            }

            return c
        })

        return cols
    }, [result])

    const execute = useCallback(async () => {
        try {

            const queryWrap = `select * from (${sql}) limit 50`
            const query = await db.select<any[]>(queryWrap)

            const sqlCount = `select count(*) as c from (${sql})`

            const queryCount = await db.select(sqlCount)

            const count = _.get(queryCount, '0.c')

            setMessage(`${count} linhas`)
            setResult(query.map((q, i) => ({ '#': i + 1, ...q })))
        } catch (e) {
            setResult([])
            setMessage(String(e))
        }

    }, [sql])

    function setTable(table: string) {
        setSql(`select * from ${table}`);
        execute()
    }



    return <div className='h-[calc(100vh-3.5rem)] overflow-hidden flex flex-col relative'>
        <ResizablePanelGroup orientation='horizontal'>
            <ResizablePanel defaultSize={'20%'}>
                <SidebarGroup>
                    <SidebarGroupLabel>Tabelas</SidebarGroupLabel>
                    <SidebarMenu>
                        {queryTables.data?.map(item => (
                            <Collapsible asChild key={item.name}>
                                <SidebarMenuItem >
                                    <SidebarMenuButton
                                    // 
                                    >
                                        <CollapsibleTrigger asChild>
                                            <Button variant={'ghost'} size={'icon'}>
                                                <ChevronRight />
                                            </Button>
                                        </CollapsibleTrigger>
                                        <span className='w-full' onClick={() => setTable(item.name)}>

                                            {item.name}
                                        </span>
                                    </SidebarMenuButton>
                                    <CollapsibleContent asChild>
                                        <SidebarMenuSub>
                                            {item.columns.map(col => (
                                                <SidebarMenuSubItem key={col.cid}>
                                                    <SidebarMenuSubButton>
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
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel>
                <ResizablePanelGroup orientation='vertical'>
                    <ResizablePanel defaultSize={'50%'} className='relative'>
                        <div className='absolute top-0 right-0 left-0 bottom-10'>
                            <Editor language='sql' height={'100%'} value={sql} onChange={v => setSql(v!)} />
                        </div>
                        <div className='absolute right-0 border-t left-0 h-10 bottom-0 flex justify-end items-center px-2'>
                            <Button onClick={execute} variant={'outline'}>Executar</Button>
                        </div>
                    </ResizablePanel>
                    <ResizableHandle withHandle />
                    <ResizablePanel defaultSize={'50%'} className='relative'>
                        <div className='absolute top-0 right-0 left-0 bottom-0'>
                            <Grid columnDefs={columns} autoGenerateColumnDefs={false} rowData={result} />
                        </div>
                        <div className='absolute border-t px-4 right-0 left-0 h-12 border bottom-0 flex items-center'>
                            <span className='text-sm  flex-1'>

                                {message}
                            </span>
                            <Button onClick={() => selectFileExport()} variant={'outline'}>
                                {mutationExportCSV.isPending && (
                                    <Spinner />
                                )}
                                Exportar CSV</Button>
                        </div>
                    </ResizablePanel>
                </ResizablePanelGroup>
            </ResizablePanel>
        </ResizablePanelGroup>
    </div>
}