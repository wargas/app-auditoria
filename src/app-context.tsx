import { Button } from "#components/ui/button";
import { getProject, setProject } from "#lib/utils";
import { useQuery } from "@tanstack/react-query";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { open, save } from "@tauri-apps/plugin-dialog";
import Database from "@tauri-apps/plugin-sql";
import { ComponentProps, createContext, useContext } from "react";

type AppType = {
    db: Database | null | undefined,
    sair: () => void
}

const AppContext = createContext<AppType>({} as AppType)

export function AppProvider({ children }: ComponentProps<"div">) {
    const win = getCurrentWindow()
    const query = useQuery({
        queryKey: ['db'],
        queryFn: async () => {
            const path = await getProject()

            win.setTitle('auditoria')

            if (!path) return null;



            win.setTitle(path.replace(/^sqlite\:/, ""))

            const db = await Database.load(path)

            return db;
        },
    })

    async function sairProjeto() {
        await setProject('')
        query.refetch()
    }

    async function criarProjeto() {
        const path = await save({
            title: `Criar projeto`,
            canCreateDirectories: true,
            filters: [
                {
                    name: 'sqlite', extensions: [`sqlite`]
                }
            ]
        })

        if (path) {

            const pathDb = `sqlite:${path}`

            const db = await Database.load(pathDb)

            await db.execute(`create table if not exists sped_df (id text primary key, periodo text, chave text, modelo varchar(2), tipo_emitente varchar(1), tipo_operacao varchar(1), valor_icms float, line text)`)
            await db.execute(`create table if not exists apuracao (periodo varchar(10),  vl_tot_debitos float,  vl_aj_debitos float,  vl_tot_aj_debitos float,  vl_estornos_cred float,  vl_tot_creditos float,  vl_aj_creditos float,  vl_tot_aj_creditos float,  vl_estornos_deb float,  vl_sld_credor_ant float,  vl_sld_apurado float,  vl_tot_ded float,  vl_icms_recolher float,  vl_sld_credor_transportar float,  deb_esp float)`)
            await db.execute(`create table if not exists ajuste_creditos (periodo text, codigo text, descricao text, valor float, line text)`)
            await db.execute(`create table if not exists nfce (id text primary key, chave text, valor_icms float, line text)`)
            await db.execute(`create table if not exists nfe (id text primary key, chave text, emitente text, destinatario text, tipo_operacao text, valor_icms float, line text)`)
            await db.execute(`create table if not exists cadastro (cnpj text primary key, nome text, ie text)`)

            await setProject(pathDb)

            query.refetch()
        }
    }

    async function abrirProjeto() {
        const path = await open({
            title: `Abrir projeto`,
            filters: [
                {
                    name: 'sqlite',
                    extensions: [`sqlite`]
                }
            ]
        })

        if (!path) return;


        await setProject(`sqlite:${path}`)
        query.refetch()
    }

    return <AppContext.Provider value={{ db: query.data, sair: sairProjeto }}>
        {query.data == null ? (
            <div className="flex h-screen justify-center items-center gap-4">
                <Button onClick={abrirProjeto} variant={`outline`}>Abrir Projeto</Button>

                <Button onClick={criarProjeto} variant={`outline`}>Criar Novo Projeto</Button>
            </div>
        ) : children}
    </AppContext.Provider>
}


export function useApp() {
    const context = useContext(AppContext)

    return context
}