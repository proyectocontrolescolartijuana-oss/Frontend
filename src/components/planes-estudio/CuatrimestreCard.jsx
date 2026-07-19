import MateriaItem from "./MateriaItem";

export default function CuatrimestreCard({
  materiaPlan,
  onEditar,
  onEliminar,
}) {
  return (
    <MateriaItem
      materiaPlan={materiaPlan}
      onEditar={onEditar}
      onEliminar={onEliminar}
    />
  );
}
