import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';

export const metadata: Metadata = {
  title: 'DevLog — Developer Micro-Blog',
  description: 'TILs, code snippets, and dev notes with markdown and syntax highlighting',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen">
          <header className="sticky top-0 z-40 border-b bg-white/80 backdrop-blur-sm">
            <div className="mx-auto flex h-12 max-w-3xl items-center justify-between px-4">
              <div className="flex items-center gap-5">
                <Link href="/" className="text-lg font-bold text-brand-700">
                  DevLog
                </Link>
                <nav className="flex items-center gap-3 text-sm">
                  <Link href="/" className="text-gray-500 hover:text-gray-900">
                    Feed
                  </Link>
                  <Link href="/tags" className="text-gray-500 hover:text-gray-900">
                    Tags
                  </Link>
                  <Link href="/new" className="text-gray-500 hover:text-gray-900">
                    Write
                  </Link>
                </nav>
              </div>
              <a
                href="https://github.com/yourusername/devlog"
                className="text-xs text-gray-400 hover:text-gray-600"
                target="_blank"
                rel="noopener noreferrer"
              >
                GitHub
              </a>
            </div>
          </header>

          <main className="mx-auto max-w-3xl px-4 py-8">{children}</main>

          <footer className="border-t py-6 text-center text-xs text-gray-400">
            DevLog — Share what you learned today
          </footer>
        </div>
      </body>
    </html>
  );
}
