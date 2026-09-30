import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { DialogSaveSQL } from "./dialog-save-sql"
import { useTheme } from "./theme-provider"
import { Button } from "./ui/button"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "./ui/resizable"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useApp } from "../app-context"
import { show, parse } from "sql-parser-cst"
import { Store } from "@tauri-apps/plugin-store"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Spinner } from "./ui/spinner"
import { Grid } from "./grid"
import { Input } from "./ui/input"
import { create } from "@tauri-apps/plugin-fs"
import { save } from "@tauri-apps/plugin-dialog"
import _ from "lodash"
import { ColDef } from "ag-grid-community"
import { useConsulta, useSql } from "./consultas-provider"
import { info } from "@tauri-apps/plugin-log"
import emitter from "#lib/emitter"
import { sql as sqlLang } from "@codemirror/lang-sql"
import ReactCodeMirror, { EditorView, oneDark, keymap, Prec } from "@uiw/react-codemirror";
import { SQLite } from "#lib/sqlite-dialect"



type Props = {
    id: string
}

const LIMIT_RESULTS = 1000

const extensions = [

    EditorView.theme({
        "&": {
            fontFamily: "'Inter Variable', monospace",
            fontSize: "16px"
        },
        ".cm-content": {
            fontFamily: "'JetBrains Mono Variable', monospace",
            // backgroundColor: 'oklch(20.463% 0.00002 271.152);'
        }
    }),
    // oneDark
]

function editorTheme(dark: boolean) {
    return EditorView.theme({
        "&": {
            fontFamily: "'Inter Variable', monospace",
            fontSize: "16px"
        },
        ".cm-content": {
            fontFamily: "'JetBrains Mono Variable', monospace",
            ...dark ? { backgroundColor: 'oklch(20.463% 0.00002 271.152);' } : {}
        }
    });
}

export function ConsultaTab({ id }: Props) {
    const app = useApp()
    const db = app.db!
    const { theme } = useTheme()
    const [message, setMessage] = useState('')
    const [page, setPage] = useState(1);
    const [sql, setSQL] = useSql(id)
    const [error, setError] = useState('')
    const queryClient = useQueryClient()
    const [hashQuery, setHashQuery] = useState('')
    const { schema } = useConsulta()
    const [editorH, setEditorH] = useState(0)
    const [mode, setMode] = useState<"ALL" | "SELECTION">("ALL")

    const refEditor = useRef<EditorView>(null)

    const queryResult = useQuery({
        queryKey: ['query-result', page, hashQuery],
        queryFn: async () => {
            info(`rodando SQL`)
            if (hashQuery == '') return {};
            setError('')
            try {

                const timeStart = new Date().getTime()


                let sqlText = sql

                if (refEditor.current && mode == "SELECTION") {
                    const { from, to } = refEditor.current?.state.selection.main

                    const textSelected = refEditor.current.state.sliceDoc(from, to)

                    sqlText = textSelected
                }

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

                if (executeStmts.length > 0) {

                    queryClient.refetchQueries({ queryKey: ['tables'] })
                    // queryTables.refetch()
                }

                const selectStmt = cst.statements.find(c => c.type == 'select_stmt' || c.type == 'compound_select_stmt')

                console.log({ cst, selectStmt })

                if (!selectStmt) return { result: [], count: 0 }

                const select = show(selectStmt).trim()

                const story = await Store.load(`history.json`)

                const history = await story.get<string[]>(`queries`) ?? []

                await story.set(`queries`, [sql, ...history.filter((_, i) => i < 20)])

                await queryClient.refetchQueries({ queryKey: ['sql-history'] })

                const limit = LIMIT_RESULTS;
                const offset = (page - 1) * limit

                const queryWrap = `select * from (${select}) limit ${offset}, ${limit}`


                const query = await db.select<any[]>(queryWrap)

                const sqlCount = `select count(*) as c from (${select})`

                const queryCount = await db.select(sqlCount)

                const count = _.get(queryCount, '0.c')

                const endTime = new Date().getTime()

                setMessage(`${count} linhas em ${endTime - timeStart} ms`)

                return {
                    count, result: query.map((q, i) => ({ '#': i + offset + 1, ...q }))
                }
                // setResult(query.map((q, i) => ({ '#': i + 1, ...q })))
            } catch (e) {
                console.log(e)
                setError(String(e))
                return { result: [], count: 0 }
            }
        },
        placeholderData: keepPreviousData
    })

    const last_page = useMemo(() => Math.floor((queryResult.data?.count ?? 0) / LIMIT_RESULTS) + 1, [queryResult.data])

    const mutationExportCSV = useMutation({
        mutationFn: async (path: string) => {
            try {

                const rows = await db.select<any[]>(sql)

                if (rows.length == 0) return;

                const cols = Object.keys(rows[0])

                const fileHandle = await create(path)

                await fileHandle.write(new TextEncoder().encode(cols.join(";")))

                for await (const row of rows) {
                    const dataRow = Object.values(row).map(v => {
                        if (String(v).match(/^\d{10,}$/)) return `="${v}"`;

                        if ('number' == typeof v) {
                            return v.toLocaleString('pt-BR')
                        }

                        return v
                    })
                    await fileHandle.write(new TextEncoder().encode("\n" + dataRow.join(";")))
                    setMessage(`Salvando ${rows.indexOf(row)} de ${rows.length}`)
                }

                setMessage(`Arquivo salvo com sucesso`)

                await fileHandle.close()


            } catch (error) {
                console.log(error)
            }
        }
    })

    const columns = useMemo(() => {

        const result = queryResult.data?.result || []
        if (result.length == 0) return []


        const cols = Object.keys(result[0]).map(k => {
            return { field: k, headerName: k.toUpperCase() }
        }).map((c: ColDef) => {

            if (c.field == '#') {
                return { ...c, width: 100, pinned: 'left' }
            }

            c.valueGetter = (params) => {
                return params.node?.data[c.field!]
            }

            return c
        })

        return cols as ColDef[]
    }, [queryResult.data])

    async function selectFileExport() {
        const res = await save({
            filters: [
                {
                    name: 'csv', extensions: ['csv']
                }
            ]
        })

        if (!res) return;

        await mutationExportCSV.mutateAsync(res)
    }

    const handleSendSQL = useCallback((mode = "ALL") => {

        setMode(mode as "ALL")

        setPage(1)

        setHashQuery(crypto.randomUUID())


    }, [sql])

    async function handleChangeEditor(value: string | undefined) {
        if (!value) return;
        // info(`hadle change SQL`)

        setSQL(value)
    }

    

    useEffect(() => {
        const listener = emitter.on(`run-${id}`, () => {
            info(`Escuta`)

            handleSendSQL()
        })

        // console.log(listener, `run-${id}`)

        return () => {
            listener.removeAllListeners()
        }
    }, [id])

    const sqlExtension = useMemo(() => {

        const sqlSchema: { [name: string]: string[] } = {}

        schema.forEach(s => {
            sqlSchema[s.name] = s.columns.map(c => c.name)
        })

        return sqlLang({
            dialect: SQLite,
            schema: sqlSchema,
            upperCaseKeywords: true
        })
    }, [schema])

    const hotKeys = Prec.highest(keymap.of([
        {
            key: "Mod-Enter",
            mac: "Cmd-Enter",
            win: "Ctrl-Enter",
            run: _view => {
                handleSendSQL("ALL")

                return true
            }
        },
        {
            key: "Mod-Shift-Enter",
            mac: "Cmd-Shift-Enter",
            win: "Ctrl-Shift-Enter",
            run: _view => {
                handleSendSQL("SELECTION")

                return true
            }
        },
        {
            key: "F5",
            run: _view => {
                handleSendSQL("ALL")

                return true
            }
        },
        {
            key: "Shift-F5",
            run: _view => {
                handleSendSQL("SELECTION")

                return true
            }
        }
    ]))

    return <ResizablePanelGroup orientation='vertical'>
        <ResizablePanel onResize={s => setEditorH(s.inPixels - 50)} defaultSize={'50%'} className='relative'>
            <div className='absolute top-0 right-0 left-0 bottom-10 overflow-y-scroll'>
                <ReactCodeMirror
                    value={sql}
                    onCreateEditor={view => refEditor.current = view}
                    onChange={handleChangeEditor}
                    extensions={[
                        ...extensions,
                        sqlExtension,
                        hotKeys,
                        editorTheme(theme == "dark"),
                        ...theme == "dark" ? [oneDark] : []
                    ]}
                    height={`${editorH}px`} />

            </div>
            <div style={{ height: `50px` }} className='absolute right-0 border-t left-0 bottom-0 flex gap-2 justify-end items-center px-2'>

                <DialogSaveSQL sql={sql} />

                <Button onClick={() => handleSendSQL("SELECTION")} variant={'outline'}>
                    {queryResult.isFetching && (<Spinner />)}
                    Executar Selecionado
                </Button>

                <Button onClick={() => handleSendSQL("ALL")} variant={'outline'}>
                    {queryResult.isFetching && (<Spinner />)}
                    Executar Tudo
                </Button>
            </div>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={'50%'} className='relative'>
            {/* {JSON.stringify(columns)}
            <br />
            {JSON.stringify(queryResult.data?.result)} */}
            <div className='absolute top-0 right-0 left-0 bottom-0 hiddens'>
                {error && (<div className='h-full p-4 items-center justify-center text-gray-400 flex'>{error.trim()}</div>)}
                {error == '' && (
                    <Grid

                        // onSortChanged={handleChangeSort} 
                        columnDefs={columns} autoGenerateColumnDefs={false} rowData={queryResult.data?.result || []} />
                )}
            </div>
            <div className='absolute border-t px-4 right-0 left-0 h-12 border bottom-0 flex items-center'>
                <span className='text-sm'>
                    {message}
                </span>
                <div className='flex mx-auto'>
                    <Button variant={'ghost'} disabled={page == 1} onClick={() => setPage(p => Math.max(1, p - 1))}>
                        <ChevronLeft />
                    </Button>
                    <div className='w-20'>
                        <Input value={page} onChange={t => setPage(parseInt(t.target.value))} className='text-center' />
                    </div>
                    <Button variant={'ghost'} disabled={page == last_page} onClick={() => setPage(p => Math.min(p + 1, last_page))}>
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
}