import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "#components/ui/sidebar"
import { ChartArea, Code2, FileText, HomeIcon, LogOut, Upload } from "lucide-react"
import { Link } from "react-router"
import { useApp } from "../app-context"
import { WebviewWindow } from "@tauri-apps/api/webviewWindow"

export function AppSidebar() {
    const app = useApp()

    async function openConsultas() {
        new WebviewWindow(`consultas-${new Date().getTime()}`, {
            devtools: true,
            url: '#/consultas'
        })
    }

    return <Sidebar variant="sidebar" collapsible="icon">
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

                        <SidebarMenuItem>
                            <SidebarMenuButton onClick={openConsultas}>

                                <Code2 />
                                Consultas

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