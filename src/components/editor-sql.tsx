import { EditorProps, Editor, OnMount } from "@monaco-editor/react";
import { readText } from "@tauri-apps/plugin-clipboard-manager";
import _ from "lodash";
import { editor, KeyCode, KeyMod } from "monaco-editor";
import { useRef } from "react";

type Props = {
    theme: 'dark' | 'light'
    onF5?: (value: string) => void,
    onChangeSQL?: (sql: string | undefined) => void
}

export function EditorSql({ theme, onF5 = () => { }, onChangeSQL = () => { }, ...props }: EditorProps & Props) {
    const editorRef = useRef<editor.IStandaloneCodeEditor>(null)


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

   

    return <Editor
        {...props}
        options={{ automaticLayout: true, minimap: { enabled: false } }}
        onMount={onMountEditor}
        language='sql'
        height={`100%`}
        theme={theme == "dark" ? "vs-dark" : "light"}
        onChange={(sql) => onChangeSQL(sql)} />
}