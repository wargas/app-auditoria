import { Grid } from '#components/grid';
import { Button } from '#components/ui/button';
import { useCallback, useMemo, useState } from 'react';
import { useApp } from '../app-context';
import _, { filter, uniqBy } from 'lodash'
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '#components/ui/resizable';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { SidebarProvider, } from '#components/ui/sidebar';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Spinner } from '#components/ui/spinner';
import { save } from '@tauri-apps/plugin-dialog';
import { create } from '@tauri-apps/plugin-fs';
import { Input } from '#components/ui/input';
import { Store } from '@tauri-apps/plugin-store';
import { parse, show } from 'sql-parser-cst'
import { EditorSql } from '#components/editor-sql';
import { SidebarTables } from '#components/sidebar-tables';

import { openPath } from '@tauri-apps/plugin-opener'
import { ColDef } from 'ag-grid-community';
import { DialogSaveSQL } from '#components/dialog-save-sql';

export function Component() {
    const app = useApp()
    const db = app.db!
    const [message, setMessage] = useState('')
    const [page, setPage] = useState(1);
    const [preSql, setPreSql] = useState('');
    const [sql, setSQL] = useState('')
    const [error, setError] = useState('')
    const queryClient = useQueryClient()

    const queryResult = useQuery({
        queryKey: ['query-result', sql, page],
        queryFn: async () => {
            console.log(`update`)
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

                queryTables.refetch()

                const selectStmt = cst.statements.find(c => c.type == 'select_stmt')


                if (!selectStmt) return { result: [], count: 0 }

                const select = show(selectStmt).trim()

                const story = await Store.load(`history.json`)

                const history = await story.get<string[]>(`queries`) ?? []

                await story.set(`queries`, [sql, ...history.filter((_, i) => i < 20)])

                await queryClient.refetchQueries({ queryKey: ['sql-history'] })

                const limit = 100;
                const offset = (page - 1) * limit

                const queryWrap = `select * from (${select}) limit ${offset}, ${limit}`

                console.log({ queryWrap })

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
        }
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

        await mutationExportCSV.mutateAsync(res)
    }

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

                await openPath(path)

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
                m.type as table_type,
                m.sql,
                p.name as column_name,
                p.type,
                p.cid
                from sqlite_schema m
                join pragma_table_info(m.name) p`)


            return uniqBy(query, 'table_name').map(item => {
                return {
                    name: item.table_name,
                    type: item.table_type,
                    sql: item.sql,
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
                return { ...c, width: 100, pinned: 'left' }
            }

            return c
        })

        return cols as ColDef[]
    }, [queryResult.data])


    async function handleChangeEditor(value: string | undefined) {
        if (!value) return;
        setPreSql(value)
        const store = await Store.load('editor.json')

        await store.set('code', value)
    }


    const handleChangeSQL = useCallback((newSql = '') => {

        const _sql = newSql != `` ? newSql : preSql

        setPreSql(_sql)

        try {
            const cst = parse(_sql, {
                dialect: 'sqlite',
                includeComments: false,
                includeSpaces: true,
                includeNewlines: true
            })
            console.log({ cst, _sql })
            setSQL(_sql)
        } catch (error) {

            setError(String(error))

        }
    }, [preSql, sql])


    return <SidebarProvider>

        <SidebarTables onChangeSQL={s => setPreSql(s)} schema={queryTables.data ?? []} />

        <div className='h-screen overflow-hidden flex flex-col relative w-full'>
            <ResizablePanelGroup orientation='vertical'>
                <ResizablePanel defaultSize={'50%'} className='relative'>
                    <div className='absolute top-0 right-0 left-0 bottom-10'>
                        <EditorSql
                            onF5={(s) => {
                                console.log(s)
                                setSQL(s)
                            }}
                            value={preSql}
                            schema={queryTables.data ?? []}
                            onChangeSQL={handleChangeEditor}
                        />
                    </div>
                    <div className='absolute right-0 border-t left-0 h-10 bottom-0 flex gap-2 justify-end items-center px-2'>
                        <DialogSaveSQL sql={preSql} />

                        <Button onClick={() => handleChangeSQL()} variant={'outline'}>
                            {queryResult.isFetching && (<Spinner />)}
                            Executar
                        </Button>
                    </div>
                </ResizablePanel>
                <ResizableHandle withHandle />
                <ResizablePanel defaultSize={'50%'} className='relative'>
                    <div className='absolute top-0 right-0 left-0 bottom-0'>
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
        </div>
    </SidebarProvider>
}