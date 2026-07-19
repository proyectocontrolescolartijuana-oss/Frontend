function StatsCard({ title, value, subtitle, icon: Icon }) {
  return (
    <div className="bg-white rounded-2xl border shadow-sm p-6 flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-500 uppercase">{title}</p>

        <h3 className="text-3xl font-bold mt-2">{value}</h3>

        <p className="text-sm text-gray-400 mt-1">{subtitle}</p>
      </div>

      <div className="bg-[var(--secondary)] p-4 rounded-xl">
        <Icon className="text-[var(--primary)]" />
      </div>
    </div>
  );
}

export default StatsCard;
