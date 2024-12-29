interface SimulatorHeaderProps {
  title: string;
  description: string;
}

export const SimulatorHeader = ({ title, description }: SimulatorHeaderProps) => (
  <div className="space-y-4">
    <h1 className="text-3xl font-bold tracking-tight text-white">{title}</h1>
    <p className="text-gray-300">{description}</p>
  </div>
); 