import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { DialogSaveSQL } from "./dialog-save-sql"
import { EditorSql } from "./editor-sql"
import { useTheme } from "./theme-provider"
import { Button } from "./ui/button"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "./ui/resizable"
import { useCallback, useEffect, useMemo, useState } from "react"
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
import {  useSql } from "./consultas-provider"
import { info } from "@tauri-apps/plugin-log"
import emitter from "#lib/emitter"

type Props = {
    id: string
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

    const queryResult = useQuery({
        queryKey: ['query-result', hashQuery],
        queryFn: async () => {
            info(`rodando SQL`)
            if(hashQuery == '') return {};
            setError('')
            try {

                const timeStart = new Date().getTime()
                const sqlText = sql

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

                if(executeStmts.length > 0) {

                    queryClient.refetchQueries({queryKey: ['tables']})
                    // queryTables.refetch()
                }

                const selectStmt = cst.statements.find(c => c.type == 'select_stmt' || c.type == 'compound_select_stmt')

                console.log({cst, selectStmt})

                if (!selectStmt) return { result: [], count: 0 }

                const select = show(selectStmt).trim()

                console.log({select})


                const story = await Store.load(`history.json`)

                const history = await story.get<string[]>(`queries`) ?? []

                await story.set(`queries`, [sql, ...history.filter((_, i) => i < 20)])

                await queryClient.refetchQueries({ queryKey: ['sql-history'] })

                const limit = 1000;
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
        }).map((c:ColDef) => {

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

    const handleSendSQL = useCallback(() => {

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

    
    return <ResizablePanelGroup orientation='vertical'>
        <ResizablePanel defaultSize={'50%'} className='relative'>
            <div className='absolute top-0 right-0 left-0 bottom-10'>
                <EditorSql
                    theme={theme as 'dark'}
                    onF5={(s) => {
                        info(`F5`)
                        setSQL(s)
                        handleSendSQL()
                    }}
                    value={sql}
                    onChangeSQL={handleChangeEditor}
                />
            </div>
            <div className='absolute right-0 border-t left-0 h-10 bottom-0 flex gap-2 justify-end items-center px-2'>

                <DialogSaveSQL sql={sql} />

                <Button onClick={() => handleSendSQL()} variant={'outline'}>
                    {queryResult.isFetching && (<Spinner />)}
                    Executar
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
}