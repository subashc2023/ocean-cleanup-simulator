import './globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="bg-[#0d1117]">
      <head>
        <title>Ocean Cleanup Simulator</title>
      </head>
      <body className="min-h-screen bg-[#0d1117]">
        <main className="min-h-screen bg-[#0d1117]">
          {children}
        </main>
      </body>
    </html>
  );
}