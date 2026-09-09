import { Button } from "#components/ui/button";
import { Spinner } from "#components/ui/spinner";
import { initDb } from "#lib/database";
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

            await initDb(db)

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

        {query.isFetching && (
            <div className="flex h-screen justify-center items-center gap-4">
                <Spinner />
            </div>
        )}

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