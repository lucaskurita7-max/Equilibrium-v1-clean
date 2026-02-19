import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { computeMetabolicPlan } from '../../src/core/metabolic/metabolic';
import type { MetabolicInput } from '../../src/core/metabolic/types';

/*
 * Página de cadastro de novo paciente na área restrita (/app/new-patient).
 * Antes de renderizar, verifica se existe sessão eq_session; caso contrário,
 * redireciona para /login. Ao submeter o formulário, calcula o plano
 * metabólico, adiciona o paciente (com tenantId correspondente) ao
 * localStorage e redireciona para a página de detalhes.
 */

interface Session {
  email: string;
  role: string;
  tenantId: string;
}

function getSession(): Session | null {
  if (typeof window === 'undefined') return null;
  const data = localStorage.getItem('eq_session');
  return data ? JSON.parse(data) : null;
}

export default function NewPatientPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: '',
    birthDate: '',
    sexo: 'F',
    alturaM: '',
    pesoKg: '',
    objetivo: 'Emagrecimento',
    nivelAtividade: 'Sedentario',
    sport: 'Fitness',
    bfPercent: '',
    massaMagraKg: '',
  });

  useEffect(() => {
    const session = getSession();
    if (!session) {
      router.push('/login');
    }
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const session = getSession();
    if (!session) {
      router.push('/login');
      return;
    }
    // Build metabolic input
    const input: MetabolicInput = {
      sexo: form.sexo as any,
      idade: form.birthDate ? Math.max(0, new Date().getFullYear() - new Date(form.birthDate).getFullYear()) : 0,
      pesoKg: parseFloat(form.pesoKg) || 0,
      alturaM: parseFloat(form.alturaM) || 0,
      sport: form.sport as any,
      nivelAtividade: form.nivelAtividade as any,
      objetivo: form.objetivo as any,
      bfPercent: form.bfPercent ? parseFloat(form.bfPercent) : undefined,
      massaMagraKg: form.massaMagraKg ? parseFloat(form.massaMagraKg) : undefined,
    };
    const metabolic = computeMetabolicPlan(input);
    // Salva paciente no localStorage com tenantId
    if (typeof window !== 'undefined') {
      const data = localStorage.getItem('patients');
      const patients = data ? JSON.parse(data) : [];
      const id = patients.length > 0 ? Math.max(...patients.map((p: any) => p.id)) + 1 : 1;
      patients.push({ id, name: form.name, input, metabolic, tenantId: session.tenantId });
      localStorage.setItem('patients', JSON.stringify(patients));
      // Redireciona para detalhes
      router.push(`/app/patients/${id}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <h1 className="text-2xl mb-4">Novo Paciente</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label>Nome:</label>
          <input name="name" value={form.name} onChange={handleChange} className="w-full p-2 bg-gray-700" required />
        </div>
        <div>
          <label>Data de nascimento:</label>
          <input type="date" name="birthDate" value={form.birthDate} onChange={handleChange} className="w-full p-2 bg-gray-700" />
        </div>
        <div>
          <label>Sexo:</label>
          <select name="sexo" value={form.sexo} onChange={handleChange} className="w-full p-2 bg-gray-700">
            <option value="F">Feminino</option>
            <option value="M">Masculino</option>
          </select>
        </div>
        <div>
          <label>Altura (m):</label>
          <input name="alturaM" value={form.alturaM} onChange={handleChange} className="w-full p-2 bg-gray-700" required />
        </div>
        <div>
          <label>Peso (kg):</label>
          <input name="pesoKg" value={form.pesoKg} onChange={handleChange} className="w-full p-2 bg-gray-700" required />
        </div>
        <div>
          <label>Objetivo:</label>
          <select name="objetivo" value={form.objetivo} onChange={handleChange} className="w-full p-2 bg-gray-700">
            <option value="Emagrecimento">Emagrecimento</option>
            <option value="Recomposicao">Recomposição</option>
            <option value="Hipertrofia">Hipertrofia</option>
            <option value="Performance">Performance</option>
          </select>
        </div>
        <div>
          <label>Nível de atividade:</label>
          <select name="nivelAtividade" value={form.nivelAtividade} onChange={handleChange} className="w-full p-2 bg-gray-700">
            <option value="Sedentario">Sedentário</option>
            <option value="Leve">Leve</option>
            <option value="Moderado">Moderado</option>
            <option value="Alto">Alto</option>
            <option value="MuitoAlto">Muito alto</option>
          </select>
        </div>
        <div>
          <label>Tipo de esporte:</label>
          <select name="sport" value={form.sport} onChange={handleChange} className="w-full p-2 bg-gray-700">
            <option value="Fitness">Fitness</option>
            <option value="Endurance">Endurance</option>
            <option value="Intermitente">Intermitente</option>
            <option value="ForcaHipertrofia">Força/hipertrofia</option>
            <option value="Clinico">Clínico</option>
          </select>
        </div>
        <div>
          <label>% Gordura (opcional):</label>
          <input name="bfPercent" value={form.bfPercent} onChange={handleChange} className="w-full p-2 bg-gray-700" />
        </div>
        <div>
          <label>Massa magra (kg) (opcional):</label>
          <input name="massaMagraKg" value={form.massaMagraKg} onChange={handleChange} className="w-full p-2 bg-gray-700" />
        </div>
        <button type="submit" className="bg-green-600 hover:bg-green-700 p-2 rounded">Gerar Planejamento</button>
      </form>
    </div>
  );
}