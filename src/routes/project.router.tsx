import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "#components/ui/collapsible"
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuAction, SidebarMenuButton, SidebarMenuItem, SidebarMenuSub, SidebarMenuSubItem, SidebarProvider, SidebarTrigger } from "#components/ui/sidebar"
import { ChartArea, ChevronDown, FileText, HomeIcon, Upload } from "lucide-react"
import { Link, Outlet, useParams } from "react-router"

export function Component() {
    const params = useParams()
    return <div>
        <SidebarProvider>
            <Sidebar variant="floating" collapsible="icon">
                <SidebarContent>
                    <SidebarGroup>
                        <SidebarGroupLabel>MENU</SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                <SidebarMenuItem>
                                    <SidebarMenuButton asChild>
                                        <Link to={`/project/${params.id}`}>
                                            <HomeIcon />
                                            Home
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                                <SidebarMenuItem>
                                    <SidebarMenuButton asChild>
                                        <Link to={`/project/${params.id}/arquivos`}>
                                            <Upload />
                                            Arquivos
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                                <SidebarMenuItem>
                                    <SidebarMenuButton asChild>
                                        <Link to={`/project/${params.id}/apuracao`}>
                                            <ChartArea />
                                            Apuracao
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                                <SidebarMenuItem>
                                    <SidebarMenuButton asChild>
                                        <Link to={`/project/${params.id}/outros-creditos`}>
                                            <ChartArea />
                                            Outros Creditos
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                                <Collapsible>
                                    <SidebarMenuItem>
                                        <CollapsibleTrigger asChild>
                                            <SidebarMenuButton>
                                                <FileText />
                                                Relatorios

                                                <SidebarMenuAction>
                                                    <ChevronDown />
                                                </SidebarMenuAction>
                                            </SidebarMenuButton>
                                        </CollapsibleTrigger>
                                        <CollapsibleContent asChild>
                                            <SidebarMenuSub>
                                                <SidebarMenuSubItem>
                                                    <SidebarMenuButton>Notas nao escrituradas</SidebarMenuButton>
                                                </SidebarMenuSubItem>
                                                <SidebarMenuSubItem>
                                                    <SidebarMenuButton>Notas escrituradas com valor a menor</SidebarMenuButton>
                                                </SidebarMenuSubItem>
                                            </SidebarMenuSub>
                                        </CollapsibleContent>
                                    </SidebarMenuItem>
                                </Collapsible>
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                </SidebarContent>
            </Sidebar>
            <main className="w-full h-screen overflow-hidden">
                <div className="h-12 flex items-center px-4">
                    <SidebarTrigger />
                </div>
                <Outlet />
            </main>
        </SidebarProvider>
    </div>
}