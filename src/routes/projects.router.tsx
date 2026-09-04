import { Button } from "#components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "#components/ui/table";
import { WebviewWindow } from "@tauri-apps/api/webviewWindow";
import Database from "@tauri-apps/plugin-sql";
import { useEffect, useState } from "react";

export function Component() {

    const [projects, setProjects] = useState<any[]>([])

    async function formProjeto() {
        loadProjetos()
        console.log(`abrir janela`)
        const win = new WebviewWindow('new-project', {
            url: `/#form-project`,
            title: `Novo projeto`,
            width: 400,
            height: 280
        })

        win.once('tauri://error', console.log)

        win.once('tauri://destroyed', loadProjetos)
    }

    async function abrirProjeto(id: string, name: string) {

        console.log(`abrir janela`)
        const win = new WebviewWindow('project', {
            url: `/#project/${id}`,
            title: name,
            width: 900,
            height: 380,
        })

        win.once('tauri://error', console.log)

        win.once('tauri://destroyed', loadProjetos)
    }


    async function loadProjetos() {
        const db = await Database.load('sqlite:main.sqlite');

        await db.execute(`create table if not exists projects (id integer primary key autoincrement, nome text, cnpj text)`)

        const lista = await db.select('select * from projects') as any[]

        console.log(lista)

        setProjects(lista)
    }

    async function deleteProjetos(id: string) {
        const db = await Database.load('sqlite:main.sqlite');

        await db.execute('delete from projects where id = $1', [id])

       loadProjetos()
    }

    useEffect(() => {
        loadProjetos()
    }, [])

    return <div className="p-2">
        <div className="flex justify-end">


            <Button onClick={() => formProjeto()}>Criar projeto</Button>
        </div>

        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>NOME</TableHead>
                    <TableHead>CNPJ</TableHead>
                    <TableHead></TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {projects.map(p => (
                    <TableRow key={p.id}>
                        <TableCell>{p.id}</TableCell>
                        <TableCell>{p.nome}</TableCell>
                        <TableCell>{p.cnpj}</TableCell>
                        <TableCell>
                            <div className="flex justify-end">
                                <Button onClick={() => deleteProjetos(p.id)} size={`sm`} variant={`ghost`}>
                                    excluir
                                </Button>
                                <Button onClick={() => abrirProjeto(p.id, p.nome)} size={`sm`} variant={`ghost`}>
                                    abrir
                                </Button>
                            </div>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    </div>
}