import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupAction, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuAction, SidebarMenuButton, SidebarMenuItem, SidebarMenuSub, SidebarMenuSubButton, SidebarMenuSubItem, useSidebar } from '#components/ui/sidebar';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '#components/ui/collapsible';
import { Input } from './ui/input';
import { ComponentProps, useState } from 'react';
import { Button } from './ui/button';
import { ChevronRight, Code, CodeIcon, Database, HistoryIcon, Table } from 'lucide-react';
import { cn } from '#lib/utils';
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from './ui/context-menu';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Store } from '@tauri-apps/plugin-store';


type Props = {
    schema: {
        name: string,
        type: string,
        sql: string,
        columns: any[]
    }[],
    onChangeSQL: (sql: string) => void
} & ComponentProps<"div">


export function SidebarTables({ schema, onChangeSQL }: Props) {

    const sidebar = useSidebar()

    const [searchTable, setSearchTable] = useState('')
    const [menu, setMenu] = useState<'tabelas' | 'saved' | 'history' | 'none'>('tabelas')

    const queryHistory = useQuery({
        queryKey: [`sql-history`],
        queryFn: async () => {
            const story = await Store.load(`history.json`)

            const history = await story.get<string[]>(`queries`) ?? []

            return history
        }
    })

    const querySaved = useQuery({
        queryKey: [`saved-sql`],
        queryFn: async () => {
            const story = await Store.load(`saved-sql.json`)

            const history = await story.get<string[]>(`saveds`) ?? []

            return history
        }
    })

    const mutationRemoveHistorico = useMutation({
        mutationFn: async (item: string) => {
            const story = await Store.load(`history.json`)

            const history = await story.get<string[]>(`queries`) ?? []

            await story.set('queries', history.filter(s => s != item))

            queryHistory.refetch()
        }
    })

    const mutationRemoveSaved = useMutation({
        mutationFn: async (id: string) => {
            const story = await Store.load(`saved-sql.json`)

            const history = await story.get<any[]>(`saveds`) ?? []

            await story.set('saveds', history.filter(s => String(s.id) !== id))

            querySaved.refetch()
        }
    })

    function changeMenu(_menu: 'tabelas' | 'saved' | 'history' | 'none') {
        if (menu == _menu) {
            return sidebar.toggleSidebar()
        }

        sidebar.setOpen(true)

        setMenu(_menu)
    }


    return <Sidebar collapsible='icon' className="overflow-hidden *:data-[sidebar=sidebar]:flex-row">
        <Sidebar collapsible='none' className="w-[calc(var(--sidebar-width-icon)+10px)]! border-r">
            <SidebarContent>
                <SidebarGroup className='p-0'>
                    <SidebarGroupContent className='px-1.5 pt-2'>
                        <SidebarMenu >
                            <SidebarMenuItem className=''>
                                <SidebarMenuButton className='px-2 size-12 group-data-[collapsible=icon]:size-12! [&>svg]:size-6' onClick={() => changeMenu('tabelas')}>

                                    <Database size={40} className={cn({ 'text-gray-300': menu !== `tabelas` })} />

                                    {/* <span>tabelas</span> */}
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem >
                                <SidebarMenuButton className='px-2 size-12 group-data-[collapsible=icon]:size-12! [&>svg]:size-6' onClick={() => changeMenu('saved')}>
                                    <CodeIcon className={cn({ 'text-gray-300': menu !== `saved` })} />
                                    {/* <span>history</span> */}
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <SidebarMenuButton className='px-2 size-12 group-data-[collapsible=icon]:size-12! [&>svg]:size-6' onClick={() => changeMenu('history')} >
                                    <HistoryIcon className={cn({ 'text-gray-300': menu !== `history` })} />
                                    {/* <span>history</span> */}
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
        <SidebarContent>
            {menu == 'tabelas' && (
                <SidebarGroup>
                    <SidebarGroupLabel>Tabelas</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <Input value={searchTable} onChange={e => setSearchTable(e.target.value)} />
                            </SidebarMenuItem>
                            {schema.map(item => (
                                <Collapsible asChild key={item.name} className='data-open:bg-muted group'>
                                    <SidebarMenuItem >
                                        <ContextMenu>
                                            <ContextMenuTrigger>
                                                <SidebarMenuButton
                                                // 
                                                >
                                                    <CollapsibleTrigger asChild>
                                                        <Button variant={'ghost'} size={'icon-sm'}>
                                                            <ChevronRight className='group-data-open:rotate-90' />
                                                        </Button>
                                                    </CollapsibleTrigger>
                                                    <Table className={cn({'text-yellow-400': item.type == 'table', 'text-cyan-400': item.type == 'view'})} />
                                                    <span className='w-full'>
                                                        {item.name}
                                                    </span>
                                                </SidebarMenuButton>
                                            </ContextMenuTrigger>
                                            <ContextMenuContent>
                                                <ContextMenuItem onClick={() => onChangeSQL(item.sql)}>
                                                    SQL Create
                                                </ContextMenuItem>
                                                <ContextMenuItem onClick={() => onChangeSQL(`select * from ${item.name}`)}>
                                                    Mostrar dados
                                                </ContextMenuItem>
                                                <ContextMenuItem>
                                                    Exportar
                                                </ContextMenuItem>
                                            </ContextMenuContent>
                                        </ContextMenu>
                                        <CollapsibleContent asChild>
                                            <SidebarMenuSub>
                                                {item.columns.filter(col => String(col.column_name).toLocaleLowerCase().includes(searchTable.toLocaleLowerCase())).map(col => (
                                                    <SidebarMenuSubItem key={col.cid}>
                                                        <SidebarMenuSubButton>
                                                            {col.column_name}
                                                            <SidebarMenuAction className='text-xs text-gray-400'>{col.type}</SidebarMenuAction>
                                                        </SidebarMenuSubButton>
                                                    </SidebarMenuSubItem>
                                                ))}
                                            </SidebarMenuSub>
                                        </CollapsibleContent>
                                    </SidebarMenuItem>
                                </Collapsible>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            )}

            {menu == 'history' && (
                <SidebarGroup>
                    <SidebarGroupLabel>Historico
                        <SidebarGroupAction>
                            <Button variant={`ghost`} size={`xs`}>Limpar</Button>
                        </SidebarGroupAction>
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {queryHistory.data?.map((item, i) => (
                                <SidebarMenuItem key={i}>
                                    <ContextMenu>
                                        <ContextMenuTrigger asChild>
                                            <SidebarMenuButton onClick={() => onChangeSQL(item)}>
                                                <Code className='text-pink-500' ></Code>
                                                <span>{item}</span>
                                            </SidebarMenuButton>
                                        </ContextMenuTrigger>
                                        <ContextMenuContent>
                                            <ContextMenuItem onClick={() => mutationRemoveHistorico.mutate(item)}>
                                                Excluir
                                            </ContextMenuItem>
                                        </ContextMenuContent>
                                    </ContextMenu>

                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            )}

            {menu == 'saved' && (
                <SidebarGroup>
                    <SidebarGroupLabel>Consultas Salvas</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {querySaved.data?.map((item: any, i) => (
                                <SidebarMenuItem key={i}>
                                    <ContextMenu>
                                        <ContextMenuTrigger asChild>
                                            <SidebarMenuButton onClick={() => onChangeSQL(item.sql)}>
                                                <Code className='text-pink-500'></Code>
                                                <span>{item.name}</span>
                                            </SidebarMenuButton>
                                        </ContextMenuTrigger>
                                        <ContextMenuContent>
                                            <ContextMenuItem onClick={() => mutationRemoveSaved.mutate(String(item.id))}>
                                                Excluir
                                            </ContextMenuItem>
                                        </ContextMenuContent>
                                    </ContextMenu>

                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            )}
        </SidebarContent>
    </Sidebar>
}