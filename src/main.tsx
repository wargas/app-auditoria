import React from "react";
import ReactDOM from "react-dom/client";
import { TooltipProvider } from "#components/ui/tooltip";
import { RouterProvider } from "react-router";

import { QueryClientProvider, QueryClient } from '@tanstack/react-query'
import { routes } from "./routes";
import "./App.css";
import { AppProvider } from "./app-context";

const queryClient = new QueryClient()

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <TooltipProvider>
      <QueryClientProvider client={queryClient}>
        <div className="h-screen">
          <AppProvider>
            <RouterProvider router={routes} />
          </AppProvider>
        </div>
      </QueryClientProvider>
    </TooltipProvider>
  </React.StrictMode>,
);
