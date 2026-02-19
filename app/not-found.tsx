/*
 * Custom 404 page for the Next.js App Router. When a user navigates to a
 * route that does not exist, this component will be rendered. Providing
 * a custom not‑found page improves the user experience and guides users
 * back to valid parts of the application.
 */

import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <h1 className="text-5xl font-bold mb-4">404</h1>
      <p className="mb-6 text-center">Página não encontrada.</p>
      <Link
        href="/"
        className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded"
      >
        Voltar para o início
      </Link>
    </main>
  );
}