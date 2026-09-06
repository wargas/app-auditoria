import { Button } from "#components/ui/button";
import { Item, ItemActions, ItemContent, ItemDescription, ItemGroup,  ItemTitle } from "#components/ui/item";
import { DownloadIcon } from "lucide-react";

export function Component() {
    return <div className="flex flex-col gap-1 p-4">
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