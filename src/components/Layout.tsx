import { Footer } from "./Footer";
import { Navbar } from "./Navbar";
import { isClerkConfigured } from "@/lib/auth";

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="page-shell flex min-h-screen flex-col">
      <Navbar realAccountsEnabled={isClerkConfigured()} />
      <main className="relative z-10 flex-1">{children}</main>
      <Footer />
    </div>
  );
}
