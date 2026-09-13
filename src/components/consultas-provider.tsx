import { useQuery } from "@tanstack/react-query";
import { ComponentProps, createContext, useCallback, useContext, useState } from "react";
import { useApp } from "../app-context";
import { filter, uniqBy } from "lodash";
import EventEmitter from 'eventemitter3';

export const emitter = new EventEmitter();

type Schema = {
    name: string,
    type: string,
    sql: string,
    columns: {
        name: string,
        type: string,
    }[]
}

type Tab = {
    id: string
    sql: string
    active: boolean
}

type ContextType = {
    schema: Schema[],
    updateTables: () => void,
    addTab: (sql?: string) => string

    fecharTab: (id: string) => void
    activeTab: (id: string) => void
    changeTabSQL: (id: string, sql: string) => void
    tabs: Tab[]
}

export const Context = createContext<ContextType>({} as ContextType)


export function ConsultasProvider({ children }: ComponentProps<"div">) {

    const app = useApp()
    const db = app.db!

    const [tabs, setTabs] = useState<Tab[]>([{ id: '1', sql: ``, active: true }])

    const querySchema = useQuery<Schema[]>({
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
                    name: String(item.table_name),
                    type: String(item.table_type),
                    sql: String(item.sql),
                    columns: filter(query, { table_name: item.table_name }).map(col => {
                        return {
                            name: String(col.name),
                            type: String(col.type)
                        }
                    })
                }
            })
        }
    })

    function updateTables() {
        querySchema.refetch()
    }

    const addTab = useCallback((sql?: string) => {
        const id = crypto.randomUUID()
        setTabs(list => [...list, { id, sql: sql ?? '', active: false }])

        return id
    }, [tabs])

    const fecharTab = useCallback((id: string) => {
        setTabs(list => list.filter(t => t.id != id))
    }, [tabs])

    const changeTabSQL = useCallback((id: string, newSQL: string) => {
        setTabs(list => list.map(t => {

            if (t.id == id) {
                return { ...t, sql: newSQL }
            }

            return t
        }))
    }, [])

    const activeTab = useCallback((id: string) => {
        setTabs(list => list.map(t => {

            t.active = t.id == id

            return t

        }))
    }, [])

    return <Context value={{ activeTab, changeTabSQL, fecharTab, tabs, addTab, updateTables, schema: querySchema.data ?? [] }}>
        {children}
    </Context>
}

export function useConsulta() {
    const context = useContext(Context)

    return context
}

export function useSql(id: string): [string, (s: string) => void] {
    const context = useContext(Context)

    const sql = context.tabs.find(t => t.id == id)?.sql ?? '';

    const setSql = function (sql: string) {
        context.changeTabSQL(id, sql)
    }

    return [sql, setSql]
}
