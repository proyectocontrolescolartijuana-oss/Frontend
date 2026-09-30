function SidebarItem({ item, isActive, onClick }) {
  const Icon = item.icon;

  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 transition ${
        isActive
          ? "bg-[var(--primary)] text-white shadow-lg"
          : "hover:bg-[var(--sidebar-accent)]"
      }`}
    >
      <Icon size={18} />

      <span className="text-sm font-medium">{item.label}</span>
    </button>
  );
}

export default SidebarItem;
