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
        <div className="flex h-screen flex-col bg-background">
          <Header />
          <div className="flex flex-1 min-h-0">
            <Suspense fallback={<div className="hidden w-16 shrink-0 border-r bg-muted/20 md:block" />}>
              <Sidebar categories={categories} />
            </Suspense>
            <main className="flex-1 overflow-y-auto p-4 sm:p-6">
              {children}
            </main>
          </div>
        </div>
      </ToolProvider>
    </SidebarProvider>
  );
}
