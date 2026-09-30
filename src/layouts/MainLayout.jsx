import { useState } from "react";
import Sidebar from "../components/Sidebar";

function MainLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="flex min-h-screen bg-slate-100">
      <Sidebar
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen((current) => !current)}
      />

      <main className="min-w-0 flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}

export default MainLayout;
