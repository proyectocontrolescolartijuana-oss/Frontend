import { ChevronDown, ChevronRight } from "lucide-react";
import SidebarItem from "./sidebarItem";

function SidebarSection({
  section,
  isOpen,
  onToggle,
  visibles,
  pathname,
  navigate,
}) {
  return (
    <div>
      {/* Header */}
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between px-3 py-2 text-xs font-semibold uppercase tracking-wider text-slate-400 transition hover:text-slate-200"
      >
        <span>{section.title}</span>

        {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
      </button>

      {/* Items */}
      {isOpen && (
        <div className="mt-2 space-y-1">
          {visibles.map((item) => (
            <SidebarItem
              key={item.label}
              item={item}
              isActive={pathname.startsWith(item.path)}
              onClick={() => navigate(item.path)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default SidebarSection;
