"use client";

/**
 * Componente puro de UI para listar PQRS.
 * Recibe los datos por props — NO importa Services ni Hooks.
 */

interface Pqr {
  id_pqr: number;
  tipo_pqr: string;
  descripcion: string;
  estado_pqr: string;
}

interface PqrsListProps {
  pqrs: Pqr[];
}

export default function PqrsList({ pqrs }: PqrsListProps) {
  return (
    <div>
      <h2>Mis PQRS</h2>

      {pqrs.length === 0 && <p>No hay PQRS</p>}

      {pqrs.map((p) => (
        <div key={p.id_pqr} style={{
          border: "1px solid #ccc",
          padding: "10px",
          margin: "10px 0",
          borderRadius: "8px"
        }}>
          <p><b>ID:</b> {p.id_pqr}</p>
          <p><b>Tipo:</b> {p.tipo_pqr}</p>
          <p><b>Descripción:</b> {p.descripcion}</p>
          <p><b>Estado:</b> {p.estado_pqr}</p>
        </div>
      ))}
    </div>
  );
}