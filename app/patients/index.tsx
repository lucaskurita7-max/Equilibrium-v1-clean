import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface PatientSummary {
  id: number;
  name: string;
}

function getSession() {
  if (typeof window === 'undefined') return null;
  const data = localStorage.getItem('eq_session');
  return data ? JSON.parse(data) : null;
}

function getPatients(): PatientSummary[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem('patients');
  const list: any[] = data ? JSON.parse(data) : [];
  const session = getSession();
  if (!session) return [];
  const filtered = session.role === 'admin' ? list : list.filter(p => p.tenantId === session.tenantId);
  return filtered.map((p: any) => ({ id: p.id, name: p.name }));
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
    setPatients(getPatients());
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