import { useTheme } from "#components/theme-provider";
import { Button } from "#components/ui/button";
import { Input } from "#components/ui/input";
import { Item, ItemActions, ItemContent, ItemDescription, ItemGroup, ItemSeparator, ItemTitle } from "#components/ui/item";
import { Spinner } from "#components/ui/spinner";
import { Switch } from "#components/ui/switch";
import { getConfig, setConfig } from "#lib/config";
import { useQuery } from "@tanstack/react-query";
import { invoke } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";
import { ChangeEvent } from "react";

export function Component() {

    const theme = useTheme()

    const queryConfig = useQuery({
        queryKey: ['config'],
        queryFn: async () => {
            return await getConfig()
        }
    })

    async function teste() {
        const pathZip = await open({
            multiple: false,  
        })

        if(pathZip) {
            const files = await invoke('list_zip_files', { path: pathZip})

            console.log({files})
        }
    }


    async function handleChange(event: ChangeEvent<HTMLInputElement, HTMLInputElement>) {

        await setConfig({ buffer_size: parseInt(event.target.value) })

        queryConfig.refetch()
    }

    if (queryConfig.isPending) return <div className="h-90 flex items-center justify-center">
        <Spinner />
    </div>

    return <div className="mt-4">
        
        <ItemGroup>
            <Item size={`xs`}>
                <ItemContent>
                    <ItemTitle>Tamanho do buffer</ItemTitle>
                    <ItemDescription>Tamanho que o programa ler por parte em MB</ItemDescription>
                </ItemContent>
                <ItemActions>
                    <Input onChange={handleChange} type="number" defaultValue={queryConfig.data?.buffer_size} />
                </ItemActions>
            </Item>
            <ItemSeparator />
            <Item size={`xs`}>
                <ItemContent>
                    <ItemTitle>Tema dark</ItemTitle>
                    <ItemDescription>Exibir tema escuro</ItemDescription>
                </ItemContent>
                <ItemActions>
                    <Switch checked={theme.theme == "dark"} onCheckedChange={c => theme.setTheme(c ? "dark" : "light")} />
                </ItemActions>
            </Item>
            <ItemSeparator />

            <Button className="hidden" onClick={teste}>TESTE</Button>
        </ItemGroup>
    </div>
}