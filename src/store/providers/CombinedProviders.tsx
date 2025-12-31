import { ReactNode } from "react";
import { ToastContainer } from "react-toastify";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "react-toastify/dist/ReactToastify.css";
import ReduxProvider from "./ReduxProvider";

const queryClient = new QueryClient();

function CombinedProviders({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastContainer />
      <ReduxProvider>{children}</ReduxProvider>
    </QueryClientProvider>
  );
}

export { CombinedProviders };
