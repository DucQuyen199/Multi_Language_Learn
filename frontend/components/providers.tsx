"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { useState } from "react";
import { ActionFeedbackProvider } from "@/components/action-feedback";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({ defaultOptions: { queries: { staleTime: 30_000, retry: 1 } } }));
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <ActionFeedbackProvider>
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      </ActionFeedbackProvider>
    </ThemeProvider>
  );
}
