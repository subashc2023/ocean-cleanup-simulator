import { Logo } from '@/components/ui/Logo';

interface SimulatorHeaderProps {
  title: string;
  description: string;
}

export const SimulatorHeader = ({ title, description }: SimulatorHeaderProps) => (
  <div className="text-center space-y-2">
    <h1 className="text-3xl font-bold text-gray-100 flex items-center justify-center">
      <Logo />
      {title}
    </h1>
    <p className="text-gray-400 max-w-2xl mx-auto">
      {description}
    </p>
  </div>
); 