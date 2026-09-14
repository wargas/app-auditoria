import { Button } from "#components/ui/button";
import { Item, ItemActions, ItemContent, ItemDescription, ItemGroup, ItemTitle } from "#components/ui/item";
import { WebviewWindow } from "@tauri-apps/api/webviewWindow";
import { DownloadIcon, Plus } from "lucide-react";

export function Component() {

    async function openForm() {
        new WebviewWindow(`form-relatorio`, {
            url: '#/form-relatorio',
            width: 520,
            height: 380,
            title: "Salvar Relatorio"
        })
    }

    return <div className="flex flex-col gap-1 p-4">
        <div className="flex justify-end">
            <Button variant={'outline'} onClick={openForm}>
                <Plus />
                Adicionar
            </Button>
        </div>
        <ItemGroup>
            <Item variant={'outline'}>
                <ItemContent>
                    <ItemTitle>Notas de entrada nao escrituradas</ItemTitle>
                    <ItemDescription>Relatorio com notas 55 nao escrituradas</ItemDescription>
                </ItemContent>
                <ItemActions>
                    <Button variant={'ghost'}><DownloadIcon /> </Button>
                </ItemActions>
            </Item>

            <Item variant={'outline'}>
                <ItemContent>
                    <ItemTitle>Notas saida nao escrituradas</ItemTitle>
                    <ItemDescription>Relatorio com notas 55 nao escrituradas</ItemDescription>
                </ItemContent>
                <ItemActions>
                    <Button variant={'ghost'}><DownloadIcon /> </Button>
                </ItemActions>
            </Item>

            <Item variant={'outline'}>
                <ItemContent>
                    <ItemTitle>Notas do consumidor nao escrituradas</ItemTitle>
                    <ItemDescription>Relatorio com notas 65 nao escrituradas</ItemDescription>
                </ItemContent>
                <ItemActions>
                    <Button variant={'ghost'}><DownloadIcon /> </Button>
                </ItemActions>
            </Item>

            <Item variant={'outline'}>
                <ItemContent>
                    <ItemTitle>Notas do consumidor nao escrituradas</ItemTitle>
                    <ItemDescription>Relatorio com notas 65 nao escrituradas</ItemDescription>
                </ItemContent>
                <ItemActions>
                    <Button variant={'ghost'}><DownloadIcon /> </Button>
                </ItemActions>
            </Item>
        </ItemGroup>
    </div>
}