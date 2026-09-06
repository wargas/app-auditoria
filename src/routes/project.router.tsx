import { AppSidebar } from "#components/app-sidebar"
import { SidebarProvider, SidebarTrigger } from "#components/ui/sidebar"
import { Outlet } from "react-router"


export function Component() {
    

    return <div>
        <SidebarProvider>
            <AppSidebar />
            <main className="w-full h-screen overflow-hidden">
                <div className="h-12 flex items-center px-4">
                    <SidebarTrigger />
                </div>
                <Outlet />
            </main>
        </SidebarProvider>
    </div>
}