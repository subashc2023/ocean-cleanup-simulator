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
      <body className="min-h-screen bg-gray-900">
        {children}
      </body>
    </html>
  );
}