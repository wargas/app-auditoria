import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarRail, SidebarSeparator, useSidebar } from "#components/ui/sidebar"
import { ChartArea, Code2, FileText, HomeIcon, LogOut, Settings, Upload } from "lucide-react"
import { Link, useLocation } from "react-router"
import { useApp } from "../app-context"
import { WebviewWindow } from "@tauri-apps/api/webviewWindow"
import { useMemo } from "react"

export function AppSidebar() {
    const app = useApp()
    const sidebar = useSidebar()
    const { pathname } = useLocation()

    const menuSize = useMemo(() => {

        return sidebar.open ? 'lg' : 'default'
    }, [sidebar.open])

    async function openConsultas() {
        new WebviewWindow(`consultas-${new Date().getTime()}`, {
            devtools: true,
            url: '#/consultas'
        })
    }

    return <Sidebar variant="sidebar" collapsible="icon" className="top-(--header-height) h-[calc(100svh-var(--header-height))]!">
        <SidebarContent>

            <SidebarGroup>
                <SidebarGroupLabel>MENU</SidebarGroupLabel>
                <SidebarGroupContent>
                    <SidebarMenu>

                        <SidebarMenuItem>
                            <SidebarMenuButton isActive={pathname == '/'} asChild size={menuSize}>
                                <Link to={`/`}>
                                    <HomeIcon />
                                    Home
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <SidebarMenuButton isActive={pathname == '/arquivos'} asChild size={menuSize}>
                                <Link to={`/arquivos`}>
                                    <Upload />
                                    Arquivos
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <SidebarMenuButton isActive={pathname == '/apuracao'} asChild size={menuSize}>
                                <Link to={`/apuracao`}>
                                    <ChartArea />
                                    Apuracao
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <SidebarMenuButton isActive={pathname == '/outros-creditos'} asChild size={menuSize}>
                                <Link to={`/outros-creditos`}>
                                    <ChartArea />
                                    Outros Creditos
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <SidebarMenuButton isActive={pathname == '/relatorios'} asChild size={menuSize}>
                                <Link to={`/relatorios`}>
                                    <FileText />
                                    Relatorios
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>

                        <SidebarMenuItem>
                            <SidebarMenuButton onClick={openConsultas} size={menuSize}>

                                <Code2 />
                                Consultas SQL

                            </SidebarMenuButton>
                        </SidebarMenuItem>
                        <SidebarSeparator />
                        <SidebarMenuItem>
                            <SidebarMenuButton isActive={pathname == '/settings'} asChild size={menuSize}>
                                <Link to={`/settings`}>
                                    <Settings />
                                    Configurações
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
                    <SidebarMenuButton size={menuSize} onClick={app.sair}><LogOut /> Fechar Projeto</SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
        </SidebarFooter>
        <SidebarRail />
    </Sidebar>
}
