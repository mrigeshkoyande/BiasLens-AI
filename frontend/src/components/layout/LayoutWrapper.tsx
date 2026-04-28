'use client';
import { usePathname } from 'next/navigation';
import TopNav from "./TopNav";
import Sidebar from "./Sidebar";
import ChatPanel from "../chat/ChatPanel";

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/login';

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <>
      <TopNav />
      <div className="app-shell">
        <Sidebar />
        <main className="app-main">{children}</main>
      </div>
      <ChatPanel />
    </>
  );
}
