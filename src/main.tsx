import React from "react";
import ReactDOM from "react-dom/client";
import { TooltipProvider } from "#components/ui/tooltip";
import { RouterProvider } from "react-router";
import { routes } from "./routes";
import "./App.css";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <TooltipProvider>
      <div className="h-screen">
        <RouterProvider router={routes} />
      </div>
    </TooltipProvider>
  </React.StrictMode>,
);
