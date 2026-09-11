import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuAction, SidebarMenuButton, SidebarMenuItem, SidebarMenuSub, SidebarMenuSubButton, SidebarMenuSubItem, useSidebar } from '#components/ui/sidebar';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '#components/ui/collapsible';
import { Input } from './ui/input';
import { ComponentProps, useState } from 'react';
import { Button } from './ui/button';
import { ChevronRight, CodeIcon, Database, HistoryIcon } from 'lucide-react';
import { cn } from '#lib/utils';


type Props = {
    schema: {
        name: string,
        columns: any[]
    }[],
} & ComponentProps<"div">


export function SidebarTables({ schema }: Props) {

    const sidebar = useSidebar()

    const [searchTable, setSearchTable] = useState('')
    const [menu, setMenu] = useState<'tabelas' | 'saved' | 'history' | 'none'>('tabelas')

    function changeMenu(_menu: 'tabelas' | 'saved' | 'history' | 'none') {
        if(menu == _menu) {
            return sidebar.toggleSidebar()
        }

        sidebar.setOpen(true)

        setMenu(_menu)
    }

    return <Sidebar collapsible='icon' className="overflow-hidden *:data-[sidebar=sidebar]:flex-row">
        <Sidebar collapsible='none' className="w-[calc(var(--sidebar-width-icon)+1px)]! border-r">
            <SidebarContent>
                <SidebarGroup className='p-0'>
                    <SidebarGroupContent className='px-1.5 pt-2'>
                        <SidebarMenu >
                            <SidebarMenuItem className=''>
                                <SidebarMenuButton className='px-2 size-12 group-data-[collapsible=icon]:size-12! [&>svg]:size-6' onClick={() => changeMenu('tabelas')}>
                                    
                                    <Database size={40} className={cn({'text-gray-300': menu !== `tabelas`})} />
                                    
                                    {/* <span>tabelas</span> */}
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem >
                                <SidebarMenuButton className='px-2 size-12 group-data-[collapsible=icon]:size-12! [&>svg]:size-6'  onClick={() => changeMenu('saved')}>
                                    <CodeIcon className={cn({'text-gray-300': menu !== `saved`})}  />
                                    {/* <span>history</span> */}
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <SidebarMenuButton className='px-2 size-12 group-data-[collapsible=icon]:size-12! [&>svg]:size-6' onClick={() => changeMenu('history')} >
                                    <HistoryIcon className={cn({'text-gray-300': menu !== `history`})}  />
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
                                        <SidebarMenuButton
                                        // 
                                        >
                                            <CollapsibleTrigger asChild>
                                                <Button variant={'ghost'} size={'icon'}>
                                                    <ChevronRight className='group-data-open:rotate-90' />
                                                </Button>
                                            </CollapsibleTrigger>
                                            <span className='w-full'>
                                                {item.name}
                                            </span>
                                        </SidebarMenuButton>
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

        </SidebarContent>
    </Sidebar>
}