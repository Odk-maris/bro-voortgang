
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  getStudentLatestGrades, 
  getStudentAverageGrade, 
  getSubjectById 
} from '@/utils/supabaseData';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import TestProgressBar from './TestProgressBar';
import FeedbackItem from './FeedbackItem';

interface SubjectCardProps {
  studentId: number | string;  // Accept either number or string student ID
  subjectId: number;
}

const SubjectCard = ({ studentId, subjectId }: SubjectCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const subject = getSubjectById(subjectId);
  const latestGrades = getStudentLatestGrades(studentId, subjectId);
  const averageGrade = getStudentAverageGrade(studentId, subjectId);
  
  if (!subject) return null;
  
  const getCategoryColor = (category: string) => {
    switch(category) {
      case 'verrichtingen':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'roeitechniek':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'stuurkunst':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };
  
  const getGradeColor = (grade: number) => {
    switch(grade) {
      case 1:
        return 'bg-red-100 text-red-700 border-red-200';
      case 2:
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 3:
        return 'bg-green-100 text-green-700 border-green-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };
  
  const getGradeLabel = (grade: number) => {
    switch(grade) {
      case 1:
        return 'Moet verbeteren';
      case 2:
        return 'Voldoende';
      case 3:
        return 'Uitstekend';
      default:
        return 'Niet beoordeeld';
    }
  };
  
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mb-4"
    >
      <Card 
        className={`overflow-hidden transition-all duration-200 border ${isExpanded ? 'shadow-md' : 'hover:shadow-sm'}`}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <CardHeader className="py-3 px-4 flex flex-row items-center justify-between cursor-pointer">
          <div>
            <CardTitle className="text-base font-medium">{subject.name}</CardTitle>
            <Badge variant="outline" className={`mt-1 text-xs ${getCategoryColor(subject.category)}`}>
              {subject.category}
            </Badge>
          </div>
          
          <div className="flex items-center gap-2">
            {averageGrade > 0 ? (
              <Badge className={`text-xs font-semibold ${getGradeColor(Math.round(averageGrade))}`}>
                {averageGrade.toFixed(1)}
              </Badge>
            ) : (
              <Badge variant="outline" className="text-xs bg-gray-100 text-gray-500 border-gray-200">
                Geen beoordeling
              </Badge>
            )}
          </div>
        </CardHeader>
        
        {isExpanded && (
          <CardContent className="pb-4 pt-0 px-4">
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium mb-2">Recente beoordelingen</h4>
                <div className="grid grid-cols-3 gap-2">
                  {latestGrades.length > 0 ? (
                    latestGrades.map((grade, index) => (
                      <div key={index} className="text-center">
                        <Badge className={`inline-flex items-center justify-center w-10 h-10 rounded-full text-lg font-medium ${getGradeColor(grade.grade)}`}>
                          {grade.grade}
                        </Badge>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {new Date(grade.date).toLocaleDateString()}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-3 text-sm text-muted-foreground">
                      Nog geen beoordelingen
                    </div>
                  )}
                </div>
              </div>
              
              {latestGrades.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-2">Laatste feedback</h4>
                  <FeedbackItem feedback={latestGrades[0].feedback} date={latestGrades[0].date} />
                </div>
              )}
              
              <div>
                <h4 className="text-sm font-medium mb-2">Algemene voortgang</h4>
                <TestProgressBar 
                  value={Math.round((averageGrade / 3) * 100)} 
                  label={averageGrade > 0 ? getGradeLabel(Math.round(averageGrade)) : 'Niet beoordeeld'} 
                />
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    </motion.div>
  );
};

export default SubjectCard;
