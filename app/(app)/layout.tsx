import { AuthGuard } from "@/components/auth-guard";
import { BottomNav } from "@/components/bottom-nav";

export default function AppGroupLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthGuard>
      <div className="flex min-h-full flex-1 flex-col bg-zinc-950 text-white">
        <main className="flex-1 pb-24">{children}</main>
        <BottomNav />
      </div>
    </AuthGuard>
  );
}
