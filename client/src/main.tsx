import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import MinimalApp from "./MinimalApp";
import "./index.css";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <MinimalApp />
    </QueryClientProvider>
  </StrictMode>
);
