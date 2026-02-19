import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

/*
 * Página principal da área restrita (`/app`).
 * Lista os pacientes cadastrados para o usuário atual (multi‑tenant),
 * mostra o total e fornece link para cadastrar novos pacientes.
 * Esta página verifica a presença de `eq_session` no localStorage
 * e redireciona para `/login` se não houver sessão.
 */

interface Patient {
  id: number;
  name: string;
  tenantId: string;
}

// Recupera a sessão atual a partir do localStorage
function getSession(): { email: string; role: string; tenantId: string } | null {
  if (typeof window === 'undefined') return null;
  const data = localStorage.getItem('eq_session');
  return data ? JSON.parse(data) : null;
}

// Recupera pacientes da lista no localStorage e aplica filtro multi‑tenant
function getPatientsForSession(session: { role: string; tenantId: string } | null): Patient[] {
  if (typeof window === 'undefined') return [];
  const raw = localStorage.getItem('patients');
  const list: Patient[] = raw ? JSON.parse(raw) : [];
  if (!session) return [];
  if (session.role === 'admin') return list;
  return list.filter(p => p.tenantId === session.tenantId);
}

export default function AppPage() {
  const router = useRouter();
  const [patients, setPatients] = useState<Patient[]>([]);

  useEffect(() => {
    const session = getSession();
    if (!session) {
      // Sem sessão, redireciona para login
      router.push('/login');
      return;
    }
    const list = getPatientsForSession(session);
    setPatients(list);
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <h1 className="text-2xl mb-4">Dashboard</h1>
      <p className="mb-4">Pacientes cadastrados: {patients.length}</p>
      <Link href="/app/new-patient" className="bg-green-600 hover:bg-green-700 p-2 rounded">Novo Paciente</Link>
      <h2 className="text-xl mt-6 mb-2">Pacientes recentes</h2>
      <ul>
        {patients.slice(-5).map(p => (
          <li key={p.id} className="border-b border-gray-700 py-2">
            <Link href={`/app/patients/${p.id}`}>{p.name}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}