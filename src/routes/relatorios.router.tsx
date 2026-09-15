import { Button } from "#components/ui/button";
import { Item, ItemActions, ItemContent, ItemDescription, ItemGroup, ItemTitle } from "#components/ui/item";
import { useMutation, useQuery } from "@tanstack/react-query";
import { WebviewWindow } from "@tauri-apps/api/webviewWindow";
import { DownloadIcon, Plus } from "lucide-react";
import { useApp } from "../app-context";
import { toast } from "sonner";
import { save } from "@tauri-apps/plugin-dialog";
import { create } from "@tauri-apps/plugin-fs";
import _ from "lodash";

type Item = {
    name: string,
    sql: string
}

const TOASTERID = 100;

export function Component() {
    const app = useApp()

    const queryList = useQuery({
        queryKey: ['relatorios'],
        queryFn: async () => {
            const result = app.db!.select<Item[]>('select * from relatorios')

            return result;
        }
    })

    const downloadCSV = useMutation({
        mutationFn: async (item: Item) => {


            const savePath = await save({
                filters: [{ name: 'csv', extensions: ['csv'] }]
            })

            if (!savePath) return;

            const toasterId = toast.loading('Salvando dados', {id: TOASTERID})

            console.log({toasterId})
            const items = await app.db!.select<any[]>(item.sql)

            if (items.length == 0) return;
           
            const fileHandle = await create(savePath)

            const encoder = new TextEncoder()

            const headerText = Object.keys(items[0]).join(";")

            await fileHandle.write(encoder.encode(headerText))

            var count = 0

            for await (const lines of _.chunk(items, 100)) {
                const text = "\n" + lines.map(l => Object.values(l).join(";")).join("\n");

                await fileHandle.write(encoder.encode(text))

                console.log(`${count} de ${items.length} gravados`)
                toast.loading(`${count} de ${items.length} gravados`, { id: toasterId! })
            }


            fileHandle.close()

            toast.success("Arquivo salvo com sucesso", { id: toasterId })
            // const lista = await app.db!.select<any[]>(item.sql)



        },
        onError: (err) => {
            toast.error(String(err), {id: TOASTERID})
        }
    })

    async function openForm() {
        new WebviewWindow(`form-relatorio`, {
            url: '#/form-relatorio',
            width: 520,
            height: 380,
            title: "Salvar Relatorio"
        })
    }

    return <div className="flex flex-col gap-1 p-4">
        <div className="flex justify-end mb-4">
            <Button variant={'outline'} onClick={openForm}>
                <Plus />
                Adicionar
            </Button>
        </div>
        <ItemGroup>
            {queryList.data?.map(item => (

                <Item variant={'outline'} key={item.name}>
                    <ItemContent>
                        <ItemTitle>{item.name}</ItemTitle>
                        <ItemDescription className="truncate">{item.sql}</ItemDescription>
                    </ItemContent>
                    <ItemActions>
                        <Button onClick={() => downloadCSV.mutate(item)} variant={'ghost'}><DownloadIcon /> </Button>
                    </ItemActions>
                </Item>
            ))}


        </ItemGroup>
    </div>
}