
import { useState } from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import { useAuth } from '@/context/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  getSubjectsByCategory, 
  getStudentGrades, 
  getStudentTests,
  getStudentTestCompletionCount,
  getStudentLatestCategoryFeedback,
  CATEGORIES,
  tests,
} from '@/utils/mockData';
import SubjectCard from '@/components/SubjectCard';
import GradeChart from '@/components/GradeChart';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2 } from 'lucide-react';
import FeedbackItem from '@/components/FeedbackItem';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(CATEGORIES.VERRICHTINGEN);

  if (!user) return null;

  const studentId = user.id;
  const studentGrades = getStudentGrades(studentId);
  const studentTests = getStudentTests(studentId);
  
  const verrichtingenSubjects = getSubjectsByCategory(CATEGORIES.VERRICHTINGEN);
  const roeitechniekSubjects = getSubjectsByCategory(CATEGORIES.ROEITECHNIEK);
  const stuurkunstSubjects = getSubjectsByCategory(CATEGORIES.STUURKUNST);
  
  // Get latest category feedback
  const verrichtingenFeedback = getStudentLatestCategoryFeedback(studentId, CATEGORIES.VERRICHTINGEN);
  const roeitechniekFeedback = getStudentLatestCategoryFeedback(studentId, CATEGORIES.ROEITECHNIEK);
  const stuurkunstFeedback = getStudentLatestCategoryFeedback(studentId, CATEGORIES.STUURKUNST);
  
  // Calculate grade distribution for charts
  const countGradesByValue = (grades: typeof studentGrades) => {
    const counts = { 1: 0, 2: 0, 3: 0 };
    grades.forEach(grade => counts[grade.grade as keyof typeof counts]++);
    return [
      { name: 'Needs Improvement', value: counts[1], color: '#FECACA' },
      { name: 'Satisfactory', value: counts[2], color: '#FDE68A' },
      { name: 'Excellent', value: counts[3], color: '#A7F3D0' },
    ];
  };

  const gradeDistribution = countGradesByValue(studentGrades);
  const totalTestCompletions = studentTests.filter(test => test.completed).length;
  
  // Count test completions
  const getTestCount = (testId: number) => {
    return getStudentTestCompletionCount(studentId, testId);
  };
  
  return (
    <DashboardLayout allowedRoles={['student']}>
      <div className="container py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium">Overall Progress</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-3xl font-semibold mb-1">
                {studentGrades.length}
              </div>
              <p className="text-sm text-muted-foreground">
                Total grades recorded
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium">Test Completions</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-3xl font-semibold mb-1">
                {totalTestCompletions}
              </div>
              <p className="text-sm text-muted-foreground">
                Total tests completed
              </p>
            </CardContent>
          </Card>
          
          <GradeChart 
            grades={gradeDistribution} 
            title="Grade Distribution" 
          />
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value={CATEGORIES.VERRICHTINGEN}>Verrichtingen</TabsTrigger>
            <TabsTrigger value={CATEGORIES.ROEITECHNIEK}>Roeitechniek</TabsTrigger>
            <TabsTrigger value={CATEGORIES.STUURKUNST}>Stuurkunst</TabsTrigger>
          </TabsList>
          
          <TabsContent value={CATEGORIES.VERRICHTINGEN} className="space-y-4">
            {verrichtingenFeedback && (
              <Card className="mb-4">
                <CardHeader>
                  <CardTitle className="text-base">Feedback - Verrichtingen</CardTitle>
                </CardHeader>
                <CardContent>
                  <FeedbackItem 
                    feedback={verrichtingenFeedback.feedback} 
                    date={verrichtingenFeedback.date} 
                    teacherName={verrichtingenFeedback.teacherId ? getUserById(verrichtingenFeedback.teacherId)?.name || 'Teacher' : 'Teacher'} 
                  />
                </CardContent>
              </Card>
            )}
            
            <div className="grid gap-4">
              {verrichtingenSubjects.map(subject => (
                <SubjectCard 
                  key={subject.id}
                  studentId={studentId}
                  subjectId={subject.id} 
                />
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value={CATEGORIES.ROEITECHNIEK} className="space-y-4">
            {roeitechniekFeedback && (
              <Card className="mb-4">
                <CardHeader>
                  <CardTitle className="text-base">Feedback - Roeitechniek</CardTitle>
                </CardHeader>
                <CardContent>
                  <FeedbackItem 
                    feedback={roeitechniekFeedback.feedback} 
                    date={roeitechniekFeedback.date} 
                    teacherName={roeitechniekFeedback.teacherId ? getUserById(roeitechniekFeedback.teacherId)?.name || 'Teacher' : 'Teacher'} 
                  />
                </CardContent>
              </Card>
            )}
            
            <div className="grid gap-4">
              {roeitechniekSubjects.map(subject => (
                <SubjectCard 
                  key={subject.id}
                  studentId={studentId}
                  subjectId={subject.id} 
                />
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value={CATEGORIES.STUURKUNST} className="space-y-4">
            {stuurkunstFeedback && (
              <Card className="mb-4">
                <CardHeader>
                  <CardTitle className="text-base">Feedback - Stuurkunst</CardTitle>
                </CardHeader>
                <CardContent>
                  <FeedbackItem 
                    feedback={stuurkunstFeedback.feedback} 
                    date={stuurkunstFeedback.date} 
                    teacherName={stuurkunstFeedback.teacherId ? getUserById(stuurkunstFeedback.teacherId)?.name || 'Teacher' : 'Teacher'} 
                  />
                </CardContent>
              </Card>
            )}
            
            <div className="grid gap-4">
              {stuurkunstSubjects.map(subject => (
                <SubjectCard 
                  key={subject.id}
                  studentId={studentId}
                  subjectId={subject.id} 
                />
              ))}
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="mt-6">
          <h2 className="text-lg font-medium mb-4">Test Completions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tests.map((test) => {
              const completionCount = getTestCount(test.id);
              return (
                <Card key={test.id} className={`transition-colors ${completionCount > 0 ? 'border-green-100 bg-green-50/50' : ''}`}>
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {completionCount > 0 ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      ) : (
                        <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
                      )}
                      <div>
                        <p className="font-medium">{test.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {completionCount > 0 ? (
                            <span>Completed {completionCount} time{completionCount !== 1 ? 's' : ''}</span>
                          ) : (
                            <span>Not yet completed</span>
                          )}
                        </p>
                      </div>
                    </div>
                    {completionCount > 0 && (
                      <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                        {completionCount} {completionCount === 1 ? 'time' : 'times'}
                      </Badge>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StudentDashboard;
