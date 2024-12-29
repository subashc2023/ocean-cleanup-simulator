import './globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <title>Ocean Cleanup Simulator</title>
      </head>
      <body className="min-h-screen bg-[#0d1117]">
        <div className="min-h-screen bg-[#0d1117]">
          {children}
        </div>
      </body>
    </html>
  );
}