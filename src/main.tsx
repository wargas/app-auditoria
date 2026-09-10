import React from "react";
import ReactDOM from "react-dom/client";
import { TooltipProvider } from "#components/ui/tooltip";
import { RouterProvider } from "react-router";

import { QueryClientProvider, QueryClient } from '@tanstack/react-query'
import { routes } from "./routes";
import "./App.css";
import { AppProvider } from "./app-context";
import { ThemeProvider } from "#components/theme-provider";
// import { warn, debug, trace, info, error } from '@tauri-apps/plugin-log';

const queryClient = new QueryClient()


// function forwardConsole(
//   fnName: 'log' | 'debug' | 'info' | 'warn' | 'error',
//   logger: (message: string) => Promise<void>
// ) {
//   const original = console[fnName];
//   console[fnName] = (message) => {
//     original(message);
//     logger(message);
//   };
// }

// forwardConsole('log', trace);
// forwardConsole('debug', debug);
// forwardConsole('info', info);
// forwardConsole('warn', warn);
// forwardConsole('error', error);

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <TooltipProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <AppProvider>
            <RouterProvider router={routes} />
          </AppProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </TooltipProvider>
  </React.StrictMode>,
);
