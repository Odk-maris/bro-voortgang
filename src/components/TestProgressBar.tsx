
import { Progress } from '@/components/ui/progress';

interface TestProgressBarProps {
  value: number;
  label: string;
}

const TestProgressBar = ({ value, label }: TestProgressBarProps) => {
  // Determine color based on progress value
  const getProgressColor = (value: number) => {
    if (value < 33) return 'bg-red-500';
    if (value < 67) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{value}%</p>
      </div>
      <Progress 
        value={value} 
        className="h-2" 
        indicatorClassName={getProgressColor(value)}
      />
    </div>
  );
};

export default TestProgressBar;
