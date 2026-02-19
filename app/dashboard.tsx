import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Patient {
  id: number;
  name: string;
}

// Recupera pacientes do localStorage e aplica filtro por tenantId se houver sessão.
function getSession() {
  if (typeof window === 'undefined') return null;
  const data = localStorage.getItem('eq_session');
  return data ? JSON.parse(data) : null;
}

function getPatients(): Patient[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem('patients');
  const list: any[] = data ? JSON.parse(data) : [];
  const session = getSession();
  if (!session) return [];
  if (session.role === 'admin') return list;
  return list.filter(p => p.tenantId === session.tenantId);
}

export default function DashboardPage() {
  const router = useRouter();
  const [patients, setPatients] = React.useState<Patient[]>([]);
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