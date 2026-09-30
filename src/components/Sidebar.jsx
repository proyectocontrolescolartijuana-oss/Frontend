import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/authStore";
import { useState } from "react";
import { ChevronLeft, LogOut, Menu } from "lucide-react";
import logo from "../assets/UnifrontLogo.png";
import { sidebarSections } from "../config/sidebarSections";
import SidebarSection from "./sidebar/sidebarSection";

function Sidebar({ isOpen, onToggle }) {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [openSections, setOpenSections] = useState({
    General: true,
    Académico: true,
    Escolar: true,
    Docentes: true,
    Alumno: true,
    Administración: true,
    Documentos: true,
  });

  const toggleSection = (title) => {
    setOpenSections((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  const handleLogout = () => {
    logout();

    navigate("/");
  };

  if (!isOpen) {
    return (
      <aside className="flex min-h-screen w-16 shrink-0 flex-col items-center bg-[var(--sidebar)] px-2 py-4 text-[var(--sidebar-foreground)] shadow-lg transition-[width] duration-300">
        <button
          type="button"
          onClick={onToggle}
          aria-label="Mostrar menu"
          title="Mostrar menu"
          className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--primary)] text-white shadow-lg transition hover:bg-[var(--sidebar-accent)]"
        >
          <Menu size={22} />
        </button>
      </aside>
    );
  }

  return (
    <aside className="flex min-h-screen w-72 shrink-0 flex-col bg-[var(--sidebar)] p-4 text-[var(--sidebar-foreground)] shadow-lg transition-[width] duration-300">
      {/* Logo */}
      <div className="rounded-2xl bg-[var(--primary)] p-4 shadow-lg">
        <div className="flex items-center justify-between gap-3">
          <img
            src={logo}
            alt="Logo Unifront"
            className="h-14 max-w-44 object-contain"
          />

          <button
            type="button"
            onClick={onToggle}
            aria-label="Ocultar menu"
            title="Ocultar menu"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white transition hover:bg-white/20"
          >
            <ChevronLeft size={20} />
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="mt-8 flex-1 space-y-6 overflow-y-auto">
        {sidebarSections.map((section) => {
          const visibles = section.items.filter((item) =>
            item.roles.some((role) =>
              user?.roles?.some((userRole) => userRole.nombre === role),
            ),
          );

          if (visibles.length === 0) return null;

          return (
            <SidebarSection
              key={section.title}
              section={section}
              visibles={visibles}
              isOpen={openSections[section.title]}
              onToggle={() => toggleSection(section.title)}
              pathname={location.pathname}
              navigate={navigate}
            />
          );
        })}
      </nav>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="mt-6 flex w-full items-center gap-3 rounded-xl bg-red-500/10 px-4 py-3 text-red-300 transition hover:bg-red-500/20"
      >
        <LogOut size={18} />

        <span>Cerrar sesión</span>
      </button>
    </aside>
  );
}

export default Sidebar;
