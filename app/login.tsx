import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/*
 * Página de login modo B.
 * Esta versão não usa email/senha. Em vez disso, apresenta quatro
 * botões para entrar como diferentes perfis de usuário (admin, nutri,
 * academia e demo). Ao clicar, grava um objeto `eq_session` no
 * localStorage com email, role e tenantId correspondentes e redireciona
 * para a área restrita (`/app`). Se já existir uma sessão válida,
 * redireciona automaticamente.
 */

const SESSIONS = {
  admin: { email: 'admin@equilibrium', role: 'admin', tenantId: 'admin' },
  nutri: { email: 'nutri@demo', role: 'nutri', tenantId: 'nutri' },
  academia: { email: 'academia@demo', role: 'academia', tenantId: 'academia' },
  demo: { email: 'demo@demo', role: 'demo', tenantId: 'demo' },
};

export default function LoginPage() {
  const router = useRouter();

  // Se já houver sessão, redireciona imediatamente para /app
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const session = localStorage.getItem('eq_session');
      if (session) {
        router.push('/app');
      }
    }
  }, [router]);

  const handleLogin = (key: keyof typeof SESSIONS) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('eq_session', JSON.stringify(SESSIONS[key]));
      // Também inicializa pacientes no localStorage se ainda não existir
      const existing = localStorage.getItem('patients');
      if (!existing) {
        localStorage.setItem('patients', JSON.stringify([]));
      }
    }
    router.push('/app');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
      <div className="bg-gray-800 p-6 rounded shadow w-96 space-y-4">
        <h1 className="text-2xl mb-4 text-center">Entrar no Equilibrium</h1>
        <button
          onClick={() => handleLogin('admin')}
          className="w-full bg-indigo-600 hover:bg-indigo-700 p-2 rounded"
        >
          Entrar como Admin
        </button>
        <button
          onClick={() => handleLogin('nutri')}
          className="w-full bg-green-600 hover:bg-green-700 p-2 rounded"
        >
          Entrar como Nutri (demo)
        </button>
        <button
          onClick={() => handleLogin('academia')}
          className="w-full bg-yellow-600 hover:bg-yellow-700 p-2 rounded"
        >
          Entrar como Academia (demo)
        </button>
        <button
          onClick={() => handleLogin('demo')}
          className="w-full bg-purple-600 hover:bg-purple-700 p-2 rounded"
        >
          Entrar como Demo
        </button>
      </div>
    </div>
  );
}