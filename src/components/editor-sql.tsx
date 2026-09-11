import { EditorProps, Editor, useMonaco, OnMount } from "@monaco-editor/react";
import { readText } from "@tauri-apps/plugin-clipboard-manager";
import _ from "lodash";
import { editor, KeyCode, KeyMod } from "monaco-editor";
import { useEffect, useRef } from "react";

type Props = {
    schema: {
        name: string,
        columns: any[]
    }[],
    onF5?: (value: string) => void,
    onChangeSQL?: (sql: string | undefined) => void
}

export function EditorSql({ schema, onF5 = () => { }, onChangeSQL = () => { }, ...props }: EditorProps & Props) {
    const editorRef = useRef<editor.IStandaloneCodeEditor>(null)
    const monaco = useMonaco()

    const onMountEditor: OnMount = (editor) => {
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
                const selection = ed.getSelection()!

                ed.executeEdits('custom-paste', [{ range: selection, text, forceMoveMarkers: true }]);


            }
        });

        editor.addAction({
            id: 'run',
            label: 'run',
            keybindings: [KeyCode.F5],
            run() {
                onF5(editorRef.current?.getValue() ?? '')
            }
        })
    }

    useEffect(() => {
        if (monaco) {
            monaco.languages.registerCompletionItemProvider('sql', {
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

            monaco.languages.registerCompletionItemProvider('sql', {
                triggerCharacters: ['.'],
                provideCompletionItems(model, position, _context, _token) {

                    const word = model.getWordUntilPosition(position)

                    const line = model.getLineContent(position.lineNumber).substring(0, word.endColumn);

                    const tableName = _.last(line.trim().split(' '))?.replace(/.$/, "")


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
    }, [monaco, schema])

    return <Editor
        {...props}
        options={{ automaticLayout: true, minimap: { enabled: false } }}
        onMount={onMountEditor}
        language='sql'
        height={`100%`}
        theme={localStorage.getItem(`vite-ui-theme`) == "dark" ? "vs-dark" : "light"}
        onChange={(sql) => onChangeSQL(sql)} />
}