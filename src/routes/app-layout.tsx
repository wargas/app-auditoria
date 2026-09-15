import { Outlet, useRouteError } from "react-router";
import { AppProvider } from "../app-context";
import { get } from "lodash";
import { AlertCircleIcon } from "lucide-react";
import { Toaster } from "#components/ui/sonner";

export function Component() {
    return <AppProvider>
        <Outlet />
        <Toaster />
    </AppProvider>
}

export function ErrorBoundary() {

    const error = useRouteError()

    console.log(get(error, 'message'))

    return <div className="h-screen flex justify-center items-center p-10 flex-col">
       <AlertCircleIcon className="size-20 text-yellow-500" />
       <div className="text-lg">Aconteceu um erro</div>
       <br />
        {get(error, 'message')}
    </div>
}