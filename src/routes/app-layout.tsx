import { Outlet } from "react-router";
import { AppProvider } from "../app-context";

export function Component() {
    return <AppProvider>
        <Outlet />
    </AppProvider>
}