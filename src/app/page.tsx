import CleanupSimulator from '../components/CleanupSimulator';

export default function Home() {
  return (
    <main className="relative min-h-screen">
      <div className="ocean-ripple" />
      <div className="ocean-particles" />
      <CleanupSimulator/>
    </main>
  );
}