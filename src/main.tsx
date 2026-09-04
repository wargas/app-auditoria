import React from "react";
import ReactDOM from "react-dom/client";
import { TooltipProvider } from "#components/ui/tooltip";
import { RouterProvider } from "react-router";

import { QueryClientProvider, QueryClient } from '@tanstack/react-query'
import { routes } from "./routes";
import "./App.css";

const queryClient = new QueryClient()

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <TooltipProvider>
      <QueryClientProvider client={queryClient}>
        <div className="h-screen">
          <RouterProvider router={routes} />
        </div>
      </QueryClientProvider>
    </TooltipProvider>
  </React.StrictMode>,
);
