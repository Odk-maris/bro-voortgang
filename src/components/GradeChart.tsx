
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface GradeDistributionProps {
  grades: { name: string; value: number; color: string }[];
  title: string;
}

const GradeChart = ({ grades, title }: GradeDistributionProps) => {
  const totalGrades = grades.reduce((sum, entry) => sum + entry.value, 0);
  
  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {totalGrades > 0 ? (
          <div className="h-[200px] flex flex-col items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={grades}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {grades.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => [`${value} grades`, '']}
                  labelFormatter={() => ''}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex gap-4 mt-2">
              {grades.map((grade) => (
                <div key={grade.name} className="flex items-center text-sm">
                  <div 
                    className="h-3 w-3 rounded-full mr-1.5" 
                    style={{ backgroundColor: grade.color }}
                  ></div>
                  <span>{grade.name}: {grade.value}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="h-[200px] flex items-center justify-center text-muted-foreground">
            No grades recorded yet
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default GradeChart;
