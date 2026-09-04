import { Button } from "#components/ui/button";
import { Field, FieldLabel } from "#components/ui/field";
import { Input } from "#components/ui/input";
import { WebviewWindow } from "@tauri-apps/api/webviewWindow";
import Database from "@tauri-apps/plugin-sql";
import { useState } from "react";

export function Component() {

    const [dados, setDados] = useState({ nome: ``, cnpj: `` })

    async function salvar() {
        const db = await Database.load('sqlite:main.sqlite');

        await db.execute(`create table if not exists projects (id integer primary key autoincrement, nome text, cnpj text)`)

        await db.execute(`insert into projects (nome, cnpj) values ($1, $2)`, [dados.nome, dados.cnpj])

        await fecharJanela()
    }

    async function fecharJanela() {
        const win = WebviewWindow.getCurrent()

        console.log(win)

        win?.close()
    }

    return <div className="p-4 flex flex-col gap-4">
        <Field>
            <FieldLabel>Nome da empresa</FieldLabel>
            <Input value={dados.nome} onChange={i => setDados(d => ({ ...d, nome: i.target.value }))} />
        </Field>

        <Field>
            <FieldLabel>CNPJ</FieldLabel>
            <Input value={dados.cnpj} onChange={i => setDados(d => ({ ...d, cnpj: i.target.value }))} />
        </Field>

        <div className="flex gap-2">

            <Button variant={`outline`} onClick={fecharJanela}>Cancelar</Button>
            <Button onClick={salvar}>Salvar</Button>
        </div>
    </div>
}