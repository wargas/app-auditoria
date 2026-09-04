import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarMenuSub, SidebarMenuSubItem, SidebarProvider, SidebarTrigger } from "#components/ui/sidebar"
import { ChartArea, FileText, Upload } from "lucide-react"
import { Link, Outlet, useParams } from "react-router"

export function Component() {
    const params = useParams()
    return <div>
        <SidebarProvider>
            <Sidebar variant="sidebar">
                <SidebarContent>
                    <SidebarGroup>
                        <SidebarGroupLabel>MENU</SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
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
                                <SidebarMenuItem>
                                    <SidebarMenuButton>
                                        <FileText />
                                        Relatorios</SidebarMenuButton>
                                    <SidebarMenuSub>
                                        <SidebarMenuSubItem>
                                            <SidebarMenuButton>Notas nao escrituradas</SidebarMenuButton>
                                        </SidebarMenuSubItem>
                                        <SidebarMenuSubItem>
                                            <SidebarMenuButton>Notas escrituradas com valor a menor</SidebarMenuButton>
                                        </SidebarMenuSubItem>
                                    </SidebarMenuSub>
                                </SidebarMenuItem>
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                </SidebarContent>
            </Sidebar>
            <main className="w-full h-screen overflow-hidden">
                <div className="h-12">
                    <SidebarTrigger />
                </div>
                <Outlet />
            </main>
        </SidebarProvider>
    </div>
}