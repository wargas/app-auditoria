import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "#components/ui/sidebar"
import { ChartArea, FileText, HomeIcon, LogOut, Upload } from "lucide-react"
import { Link } from "react-router"
import { useApp } from "../app-context"

export function AppSidebar() {
    const app = useApp()
    return <Sidebar variant="floating" collapsible="icon">
        <SidebarContent>
            <SidebarGroup>
                <SidebarGroupLabel>MENU</SidebarGroupLabel>
                <SidebarGroupContent>
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton asChild>
                                <Link to={`/`}>
                                    <HomeIcon />
                                    Home
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <SidebarMenuButton asChild>
                                <Link to={`/arquivos`}>
                                    <Upload />
                                    Arquivos
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <SidebarMenuButton asChild>
                                <Link to={`/apuracao`}>
                                    <ChartArea />
                                    Apuracao
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <SidebarMenuButton asChild>
                                <Link to={`/outros-creditos`}>
                                    <ChartArea />
                                    Outros Creditos
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <SidebarMenuButton asChild>
                                <Link to={`/relatorios`}>
                                    <FileText />
                                    Relatorios
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                        
                    </SidebarMenu>
                </SidebarGroupContent>
            </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
            <SidebarMenu>
                <SidebarMenuItem>
                    <SidebarMenuButton onClick={app.sair}><LogOut /> Fechar Projeto</SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
        </SidebarFooter>
    </Sidebar>
}