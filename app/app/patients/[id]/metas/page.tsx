"use client";

// Página de edição de metas de macronutrientes e calorias para o paciente.
// Permite ao profissional ajustar kcal, proteína, carboidratos e gorduras.
// Usa storage local para persistência.

import Link from "next/link";
import { useMemo, useState } from "react";
// Importa funções de armazenamento usando caminho relativo, pois não há alias configurado.
import { getPatientById, updatePatient } from "../../../../../lib/storage";

export default function MetasPage({ params }: { params: { id: string } }) {
  const id = params.id;
  const p = useMemo(() => getPatientById(id), [id]);

  // Estados para metas nutricionais
  const [kcal, setKcal] = useState(String(p?.goals?.kcal ?? ""));
  const [proteinG, setProteinG] = useState(String(p?.goals?.proteinG ?? ""));
  const [carbsG, setCarbsG] = useState(String(p?.goals?.carbsG ?? ""));
  const [fatG, setFatG] = useState(String(p?.goals?.fatG ?? ""));

  if (!p) return <div className="p-6 text-white/80">Paciente não encontrado.</div>;

  function salvar() {
    updatePatient(id, {
      goals: {
        kcal: kcal ? Number(kcal) : undefined,
        proteinG: proteinG ? Number(proteinG) : undefined,
        carbsG: carbsG ? Number(carbsG) : undefined,
        fatG: fatG ? Number(fatG) : undefined,
      },
    });
    alert("Metas salvas ✅");
  }

  return (
    <div className="p-8 text-white">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Metas — {p.name}</h1>
        <Link className="text-white/70 hover:text-white" href={`/app/patients/${id}`}>Voltar</Link>
      </div>

      <div className="mt-6 grid gap-4 max-w-xl">
        <label className="grid gap-1">
          <span className="text-white/70 text-sm">Kcal/dia</span>
          <input
            className="rounded-lg bg-white/10 border border-white/10 p-2"
            value={kcal}
            onChange={(e) => setKcal(e.target.value)}
          />
        </label>

        <div className="grid grid-cols-3 gap-3">
          <label className="grid gap-1">
            <span className="text-white/70 text-sm">Proteína (g)</span>
            <input
              className="rounded-lg bg-white/10 border border-white/10 p-2"
              value={proteinG}
              onChange={(e) => setProteinG(e.target.value)}
            />
          </label>
          <label className="grid gap-1">
            <span className="text-white/70 text-sm">Carbo (g)</span>
            <input
              className="rounded-lg bg-white/10 border border-white/10 p-2"
              value={carbsG}
              onChange={(e) => setCarbsG(e.target.value)}
            />
          </label>
          <label className="grid gap-1">
            <span className="text-white/70 text-sm">Gord (g)</span>
            <input
              className="rounded-lg bg-white/10 border border-white/10 p-2"
              value={fatG}
              onChange={(e) => setFatG(e.target.value)}
            />
          </label>
        </div>

        <button onClick={salvar} className="mt-2 rounded-xl bg-white text-black font-medium py-2">
          Salvar
        </button>
      </div>
    </div>
  );
}