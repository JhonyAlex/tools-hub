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
    <div className="flex min-h-screen flex-col">
      <Header />
      <div className="flex flex-1">
        <Sidebar categories={categories} />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
