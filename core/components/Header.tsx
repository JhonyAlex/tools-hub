import { Wrench } from "lucide-react";
import Link from "next/link";

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center gap-4 px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <Wrench className="h-5 w-5" />
          <span>Tools Hub</span>
        </Link>
      </div>
    </header>
  );
}
