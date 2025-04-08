import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import AppSimple from "./AppSimple";
import "./index.css";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { UserProvider } from "./lib/auth";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <UserProvider>
        <AppSimple />
      </UserProvider>
    </QueryClientProvider>
  </StrictMode>
);
