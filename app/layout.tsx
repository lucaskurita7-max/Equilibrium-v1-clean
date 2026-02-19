/*
 * Root layout component for the Next.js App Router.
 * All pages in the `app/` directory are wrapped by this layout. It imports
 * global CSS (tailwind utilities or any base styles) and sets up the basic
 * HTML structure. You can add headers, footers or providers here as needed.
 */

import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Equilibrium',
  description: 'Sistema profissional de planejamento metabólico e dietético.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="bg-gray-900 text-gray-100 min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}