/*
 * Root page for the Next.js App Router.
 * This component serves as the landing page and provides a simple introduction
 * to the Equilibrium application. For now it just displays a welcome
 * message and links to the login page. You can customize this page later
 * to fit branding or redirect logic as needed.
 */

import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <h1 className="text-4xl font-bold mb-4">Bem‑vindo ao Equilibrium</h1>
      <p className="mb-6 text-center">
        Esta é a página inicial da plataforma profissional Equilibrium. Para acessar o sistema,
        faça o login com sua conta de nutricionista.
      </p>
      <Link
        href="/login"
        className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded"
      >
        Ir para o Login
      </Link>
    </main>
  );
}