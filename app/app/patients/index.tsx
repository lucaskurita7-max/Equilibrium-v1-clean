import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

/*
 * Lista de pacientes da área restrita (/app/patients).
 * Exibe todos os pacientes visíveis ao usuário atual (multi‑tenant) e
 * redireciona para /login caso não haja sessão.
 */

interface PatientSummary {
  id: number;
  name: string;
  tenantId: string;
}

function getSession(): { role: string; tenantId: string } | null {
  if (typeof window === 'undefined') return null;
  const data = localStorage.getItem('eq_session');
  return data ? JSON.parse(data) : null;
}

function getPatientsForSession(session: { role: string; tenantId: string } | null): PatientSummary[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem('patients');
  const list: PatientSummary[] = data ? JSON.parse(data) : [];
  if (!session) return [];
  if (session.role === 'admin') return list;
  return list.filter(p => p.tenantId === session.tenantId);
}

export default function PatientsPage() {
  const router = useRouter();
  const [patients, setPatients] = useState<PatientSummary[]>([]);
  useEffect(() => {
    const session = getSession();
    if (!session) {
      router.push('/login');
      return;
    }
    const list = getPatientsForSession(session);
    setPatients(list);
  }, [router]);
  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <h1 className="text-2xl mb-4">Pacientes</h1>
      <Link href="/app/new-patient" className="bg-green-600 hover:bg-green-700 p-2 rounded">Novo Paciente</Link>
      <ul className="mt-4">
        {patients.map(p => (
          <li key={p.id} className="border-b border-gray-700 py-2">
            <Link href={`/app/patients/${p.id}`}>{p.name}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}