import { Suspense } from "react";
import { Header } from "@/core/components/Header";
import { Sidebar } from "@/core/components/Sidebar";
import { getCategories } from "@/core/registry";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const categories = getCategories();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Suspense fallback={<div className="hidden w-60 shrink-0 border-r bg-muted/20 md:block" />}>
          <Sidebar categories={categories} />
        </Suspense>
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-5xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
