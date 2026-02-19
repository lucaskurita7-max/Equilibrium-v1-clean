"use client";

// Página de edição de perfil do paciente.
// Permite ao profissional registrar sexo, idade, altura, peso e objetivo.
// Usa storage local (localStorage) para persistir dados do paciente.

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
// Importa funções de armazenamento usando caminho relativo, pois não há alias configurado.
import { getPatientById, updatePatient } from "../../../../../lib/storage";

export default function PerfilPage({ params }: { params: { id: string } }) {
  const id = params.id;
  // Obtém o paciente correspondente ao ID. useMemo evita recalcular sem necessidade.
  const p = useMemo(() => getPatientById(id), [id]);

  // Estados locais para o formulário de perfil
  const [sex, setSex] = useState(p?.profile?.sex ?? "F");
  const [age, setAge] = useState(String(p?.profile?.age ?? ""));
  const [heightCm, setHeightCm] = useState(String(p?.profile?.heightCm ?? ""));
  const [weightKg, setWeightKg] = useState(String(p?.profile?.weightKg ?? ""));
  const [objective, setObjective] = useState(p?.profile?.objective ?? "");

  // Se o paciente mudar (ex.: navegação), atualiza os campos do formulário
  useEffect(() => {
    if (!p) return;
    setSex((p.profile?.sex as any) ?? "F");
    setAge(String(p.profile?.age ?? ""));
    setHeightCm(String(p.profile?.heightCm ?? ""));
    setWeightKg(String(p.profile?.weightKg ?? ""));
    setObjective(p.profile?.objective ?? "");
  }, [p]);

  // Se paciente não existir, exibe mensagem
  if (!p) return <div className="p-6 text-white/80">Paciente não encontrado.</div>;

  // Salva as alterações no perfil do paciente
  function salvar() {
    updatePatient(id, {
      profile: {
        sex: sex as any,
        age: age ? Number(age) : undefined,
        heightCm: heightCm ? Number(heightCm) : undefined,
        weightKg: weightKg ? Number(weightKg) : undefined,
        objective: objective || undefined,
      },
    });
    alert("Perfil salvo ✅");
  }

  return (
    <div className="p-8 text-white">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Perfil — {p.name}</h1>
        <Link className="text-white/70 hover:text-white" href={`/app/patients/${id}`}>
          Voltar
        </Link>
      </div>

      <div className="mt-6 grid gap-4 max-w-xl">
        <label className="grid gap-1">
          <span className="text-white/70 text-sm">Sexo</span>
          <select
            className="rounded-lg bg-white/10 border border-white/10 p-2"
            value={sex}
            onChange={(e) => setSex(e.target.value)}
          >
            <option value="F">F</option>
            <option value="M">M</option>
            <option value="Outro">Outro</option>
          </select>
        </label>

        <label className="grid gap-1">
          <span className="text-white/70 text-sm">Idade</span>
          <input
            className="rounded-lg bg-white/10 border border-white/10 p-2"
            value={age}
            onChange={(e) => setAge(e.target.value)}
          />
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="grid gap-1">
            <span className="text-white/70 text-sm">Altura (cm)</span>
            <input
              className="rounded-lg bg-white/10 border border-white/10 p-2"
              value={heightCm}
              onChange={(e) => setHeightCm(e.target.value)}
            />
          </label>
          <label className="grid gap-1">
            <span className="text-white/70 text-sm">Peso (kg)</span>
            <input
              className="rounded-lg bg-white/10 border border-white/10 p-2"
              value={weightKg}
              onChange={(e) => setWeightKg(e.target.value)}
            />
          </label>
        </div>

        <label className="grid gap-1">
          <span className="text-white/70 text-sm">Objetivo</span>
          <textarea
            className="rounded-lg bg-white/10 border border-white/10 p-2 min-h-[90px]"
            value={objective}
            onChange={(e) => setObjective(e.target.value)}
          />
        </label>

        <button onClick={salvar} className="mt-2 rounded-xl bg-white text-black font-medium py-2">
          Salvar
        </button>
      </div>
    </div>
  );
}