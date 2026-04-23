import { Suspense } from "react";
import { Header } from "@/core/components/Header";
import { Sidebar } from "@/core/components/Sidebar";
import { getCategories } from "@/core/registry";
import { SidebarProvider, ToolProvider } from "@/core/providers";

export const dynamic = "force-dynamic";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const categories = getCategories();

  return (
    <SidebarProvider>
      <ToolProvider>
        <div className="flex flex-col h-screen bg-background text-foreground antialiased selection:bg-primary/20">
          <Header />
          <div className="flex flex-1 min-h-0">
            <Suspense fallback={<div className="hidden w-16 shrink-0 border-r bg-background md:block" />}>
              <Sidebar categories={categories} />
            </Suspense>
            <main className="flex-1 overflow-y-auto px-4 py-6 md:px-8 lg:p-10 w-full max-w-[1600px] mx-auto relative">
              {children}
            </main>
          </div>
        </div>
      </ToolProvider>
    </SidebarProvider>
  );
}
