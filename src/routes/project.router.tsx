import { AppSidebar } from "#components/app-sidebar"
import { useTheme } from "#components/theme-provider"
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from "#components/ui/breadcrumb"
import { Button } from "#components/ui/button"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "#components/ui/sidebar"
import _ from "lodash"
import { MoonIcon } from "lucide-react"
import { useMemo } from "react"
import { Outlet, useMatches } from "react-router"


export function Component() {

    const matches = useMatches()

    const title = useMemo(() => {
        return _.get(matches, '2.handle.title', '-')
    }, [matches])

    const theme = useTheme()

    return <div className="[--header-height:calc(--spacing(12))]">
        <SidebarProvider className="flex flex-col">
            <div className="h-(--header-height) border-b border-t flex gap-4 items-center px-2">
                <SidebarTrigger />

                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbPage>{title}</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>

                <div className="flex-1"></div>
                <Button variant={'ghost'} onClick={() => theme.setTheme(theme.theme == "dark" ? "light" : "dark")}>
                    <MoonIcon />
                </Button>
            </div>
            <div className="flex flex-1">
                <AppSidebar />
                <SidebarInset>
                    <main className="w-full h-[calc(100svh-var(--header-height))]!  overflow-auto">                       
                        <Outlet />
                    </main>
                </SidebarInset>
            </div>
        </SidebarProvider>
    </div >
}