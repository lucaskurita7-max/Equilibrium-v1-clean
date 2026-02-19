import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { generateDietPlan } from '../../src/core/diet/dietEngine';
import { exportDietPdf } from '../../src/core/diet/pdf';
import type { MetabolicOutput, MetabolicInput } from '../../src/core/metabolic/types';

/*
 * Página de detalhes de paciente (versão simples fora da área /app).
 * Esta implementação utiliza localStorage para armazenar pacientes e
 * respeita a sessão eq_session para aplicar multi‑tenant. Se o
 * usuário não tiver permissão para visualizar o paciente, redireciona
 * para a lista. É recomendável utilizar a rota /app/patients/[id] para
 * a versão principal da aplicação.
 */

interface StoredPatient {
  id: number;
  name: string;
  input: MetabolicInput;
  metabolic: MetabolicOutput;
  diet?: any;
  tenantId?: string;
}

function getSession() {
  if (typeof window === 'undefined') return null;
  const data = localStorage.getItem('eq_session');
  return data ? JSON.parse(data) : null;
}

export default function PatientDetailPage() {
  const router = useRouter();
  const { id } = router.query as { id?: string };
  const [patient, setPatient] = useState<StoredPatient | null>(null);
  const [dietPlan, setDietPlan] = useState<any | null>(null);
  const [pdfLink, setPdfLink] = useState<string | null>(null);

  useEffect(() => {
    const session = getSession();
    if (!session) {
      router.push('/login');
      return;
    }
    if (!id || typeof window === 'undefined') return;
    const data = localStorage.getItem('patients');
    if (data) {
      const list: StoredPatient[] = JSON.parse(data);
      const found = list.find(p => p.id === Number(id));
      if (found) {
        if (session.role !== 'admin' && found.tenantId && found.tenantId !== session.tenantId) {
          router.push('/app/patients');
          return;
        }
        setPatient(found);
        if (found.diet) {
          setDietPlan(found.diet);
        }
      } else {
        router.push('/app/patients');
      }
    }
  }, [id]);

  const handleGenerateDiet = () => {
    if (!patient) return;
    const plan = generateDietPlan(patient.metabolic);
    setDietPlan(plan);
    if (typeof window !== 'undefined') {
      const data = localStorage.getItem('patients');
      const list = data ? JSON.parse(data) : [];
      const idx = list.findIndex((p: StoredPatient) => p.id === patient.id);
      if (idx >= 0) {
        list[idx].diet = plan;
        localStorage.setItem('patients', JSON.stringify(list));
      }
    }
  };

  const handleExportPdf = async () => {
    if (!patient || !dietPlan) return;
    const patientInfo = {
      name: patient.name,
      date: new Date().toISOString().split('T')[0],
      pesoKg: patient.input.pesoKg,
      alturaM: patient.input.alturaM,
      bfPercent: patient.input.bfPercent,
    };
    const buffer = await exportDietPdf(patientInfo, patient.metabolic, dietPlan);
    const blob = new Blob([buffer], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    setPdfLink(url);
  };

  if (!patient) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-6">
        <p>Carregando paciente...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <h1 className="text-2xl mb-4">Paciente: {patient.name}</h1>
      <div className="mb-4">
        <h2 className="text-xl">Dados</h2>
        <p>ID: {patient.id}</p>
        <p>Peso: {patient.input.pesoKg} kg</p>
        <p>Altura: {patient.input.alturaM} m</p>
        <p>Objetivo: {patient.input.objetivo}</p>
        <p>Nível de atividade: {patient.input.nivelAtividade}</p>
        <p>Esporte: {patient.input.sport}</p>
      </div>
      <div className="mb-4">
        <h2 className="text-xl">Resultado Metabólico</h2>
        <p>Metodologia: {patient.metabolic.bmrMethod}</p>
        <p>TMB: {patient.metabolic.bmr.toFixed(0)} kcal</p>
        <p>GET: {patient.metabolic.tdee.toFixed(0)} kcal</p>
        <p>Kcal alvo: {patient.metabolic.kcalTarget.toFixed(0)} kcal</p>
        <p>Proteína: {patient.metabolic.proteinG} g</p>
        <p>Gordura: {patient.metabolic.fatG} g</p>
        <p>Carboidrato: {patient.metabolic.carbG} g</p>
        {patient.metabolic.warnings.length > 0 && (
          <div className="mt-2 text-yellow-400">
            <h3>Avisos:</h3>
            <ul>
              {patient.metabolic.warnings.map((w, idx) => <li key={idx}>{w}</li>)}
            </ul>
          </div>
        )}
      </div>
      <div className="mb-4 space-x-4">
        <button onClick={handleGenerateDiet} className="bg-blue-600 hover:bg-blue-700 p-2 rounded">
          Gerar Dieta
        </button>
        <button
          onClick={handleExportPdf}
          className="bg-purple-600 hover:bg-purple-700 p-2 rounded"
          disabled={!dietPlan}
        >
          Exportar PDF
        </button>
        {pdfLink && (
          <a href={pdfLink} download={`plano_${patient.id}.pdf`} className="ml-2 text-blue-300 underline">
            Baixar PDF
          </a>
        )}
      </div>
      {dietPlan && (
        <div>
          <h2 className="text-xl mb-2">Plano de Dieta</h2>
          {dietPlan.meals.map((meal: any, idx: number) => (
            <div key={idx} className="mb-3">
              <h3 className="font-semibold">
                {meal.name} — {meal.kcal.toFixed(0)} kcal
              </h3>
              <ul className="ml-4 list-disc">
                {meal.items.map((it: any, i: number) => (
                  <li key={i}>{it.nome} — {it.quantity}{it.unit}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}