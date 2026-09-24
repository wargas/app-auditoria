import { useQuery } from "@tanstack/react-query";
import { ComponentProps, createContext, useCallback, useContext, useEffect, useState } from "react";
import { useApp } from "../app-context";
import { filter, uniqBy } from "lodash";
import { useMonaco } from "@monaco-editor/react";
import _ from "lodash";



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

    const monaco = useMonaco()

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
                            name: String(col.column_name),
                            type: String(col.type)
                        }
                    })
                }
            })
        }
    })

    const querySqliteFunctions = useQuery({
        queryKey: ['sqlite-functions'],
        queryFn: async () => {
            const query = await db.select<any[]>(`SELECT DISTINCT name 
                FROM pragma_function_list() 
                ORDER BY name;`)

            return query
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


    useEffect(() => {

        const schema = querySchema.data;

        if (!schema) return;
        if (!monaco) return;

        const providerFunctions = monaco.languages.registerCompletionItemProvider('sql', {
            provideCompletionItems(model, position) {
                const word = model.getWordUntilPosition(position)
                const suggestions = querySqliteFunctions.data?.map(k => ({
                    label: k.name,
                    kind: monaco.languages.CompletionItemKind.Function,
                    insertText: k.name,
                    range: {
                        startLineNumber: position.lineNumber,
                        endLineNumber: position.lineNumber,
                        startColumn: word.startColumn,
                        endColumn: word.endColumn
                    }
                })) ?? []
                return { suggestions: suggestions }
            }
        })

        const providerSqlite = monaco.languages.registerCompletionItemProvider('sql', {
            provideCompletionItems(model, position) {
                const word = model.getWordUntilPosition(position)

                const keywords = ["ABORT", "ACTION", "ADD", "AFTER", "ALL", "ALTER", "ALWAYS", "ANALYZE", "AND", "AS", "ASC", "ATTACH", "AUTOINCREMENT", "BEFORE", "BEGIN", "BETWEEN", "BY", "CASCADE", "CASE", "CAST", "CHECK", "COLLATE", "COLUMN", "COMMIT", "CONFLICT", "CONSTRAINT", "CREATE", "CROSS", "CURRENT", "CURRENT_DATE", "CURRENT_TIME", "CURRENT_TIMESTAMP", "DATABASE", "DEFAULT", "DEFERRABLE", "DEFERRED", "DELETE", "DESC", "DETACH", "DISTINCT", "DO", "DROP", "EACH", "ELSE", "END", "ESCAPE", "EXCEPT", "EXCLUDE", "EXCLUSIVE", "EXISTS", "EXPLAIN", "FAIL", "FILTER", "FIRST", "FOLLOWING", "FOR", "FOREIGN", "FROM", "FULL", "GENERATED", "GLOB", "GROUP", "GROUPS", "HAVING", "IIF", "IF", "IGNORE", "IMMEDIATE", "IN", "INDEX", "INDEXED", "INITIALLY", "INNER", "INSERT", "INSTEAD", "INTERSECT", "INTO", "IS", "ISNULL", "JOIN", "KEY", "LAST", "LEFT", "LIKE", "LIMIT", "MATCH", "MATERIALIZED", "NATURAL", "NO", "NOT", "NOTHING", "NOTNULL", "NULL", "NULLS", "OF", "OFFSET", "ON", "OR", "ORDER", "OTHERS", "OUTER", "OVER", "PARTITION", "PLAN", "PRAGMA", "PRECEDING", "PRIMARY", "QUERY", "RAISE", "RANGE", "RECURSIVE", "REFERENCES", "REGEXP", "REINDEX", "RELEASE", "RENAME", "REPLACE", "RESTRICT", "RETURNING", "RIGHT", "ROLLBACK", "ROW", "ROWS", "SAVEPOINT", "SELECT", "SET", "TABLE", "TEMP", "TEMPORARY", "THEN", "TIES", "TO", "TRANSACTION", "TRIGGER", "UNBOUNDED", "UNION", "UNIQUE", "UPDATE", "USING", "VACUUM", "VALUES", "VIEW", "VIRTUAL", "WHEN", "WHERE", "WINDOW", "WITH", "WITHOUT"];

                const suggestions = keywords.map(k => ({
                    label: k,
                    kind: monaco.languages.CompletionItemKind.Keyword,
                    insertText: k,
                    range: {
                        startLineNumber: position.lineNumber,
                        endLineNumber: position.lineNumber,
                        startColumn: word.startColumn,
                        endColumn: word.endColumn
                    }
                }))

                return { suggestions }
            }
        })

        const providerTables = monaco.languages.registerCompletionItemProvider('sql', {
            provideCompletionItems(model, position, _context, _token) {

                const word = model.getWordUntilPosition(position)

                const suggestionsTables = schema.map(t => {
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

        const providerColumns = monaco.languages.registerCompletionItemProvider('sql', {
            triggerCharacters: ['.', ' '],
            provideCompletionItems(model, position, _context, _token) {

                const word = model.getWordUntilPosition(position)

                const line = model.getLineContent(position.lineNumber).substring(0, word.endColumn);

                let tableName = _.last(line.trim().split(' '))?.replace(/.$/g, "") ?? ""

                if (tableName.includes("(")) {
                    tableName = tableName.substring(tableName.lastIndexOf("(") + 1).replace(/\./g, "")
                }

                // info(tableName!)

                if (!tableName) return { suggestions: [] }

                const sqlText = model.getValue()

                const regexAlias = /\b(?:FROM|JOIN)\s+([a-zA-Z0-9_]+)(?:\s+(?:AS\s+)?([a-zA-Z0-9_]+))?/gi;

                const tableAlias: { name: string, alias: string }[] = []

                while (true) {
                    const match = regexAlias.exec(sqlText);

                    if (match == null) break;

                    tableAlias.push({
                        name: match[1],
                        alias: match[2]
                    })
                }


                const suggestionsTables = schema.filter(t =>
                    String(t.name).toLocaleLowerCase() == tableName.toLocaleLowerCase() ||
                    tableAlias.find(a => a.alias == tableName)?.name == String(t.name)
                ).flatMap(t => {
                    return t.columns.map(c => {

                        return {
                            label: c.name!,
                            kind: monaco.languages.CompletionItemKind.Keyword,
                            insertText: String(c.name),
                            documentation: `table ${c.name}`,
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

        return () => {
            providerTables.dispose()
            providerColumns.dispose()
            providerSqlite.dispose()
            providerFunctions.dispose()
        }

    }, [monaco, querySchema.data, querySqliteFunctions.data])

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
