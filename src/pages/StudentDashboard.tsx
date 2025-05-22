
import { useState, useEffect } from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import { useAuth } from '@/context/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  getSubjectsByCategory, 
  getStudentGrades, 
  getStudentTests,
  getStudentTestCompletionCount,
  getStudentCategoryFeedback,
  getUserById,
  CATEGORIES,
  getAllTests,
  convertId,
  convertIdToString
} from '@/utils/supabaseData';
import SubjectCard from '@/components/SubjectCard';
import GradeChart from '@/components/GradeChart';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2 } from 'lucide-react';
import FeedbackItem from '@/components/FeedbackItem';
import { CategoryEnum } from '@/integrations/supabase/client';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<CategoryEnum>(CATEGORIES.VERRICHTINGEN);
  const [studentGrades, setStudentGrades] = useState<any[]>([]);
  const [studentTests, setStudentTests] = useState<any[]>([]);
  const [verrichtingenFeedback, setVerrichtingenFeedback] = useState<any[]>([]);
  const [roeitechniekFeedback, setRoeitechniekFeedback] = useState<any[]>([]);
  const [stuurkunstFeedback, setStuurkunstFeedback] = useState<any[]>([]);
  const [testCompletionCounts, setTestCompletionCounts] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(true);
  const [verrichtingenSubjects, setVerrichtingenSubjects] = useState<any[]>([]);
  const [roeitechniekSubjects, setRoeitechniekSubjects] = useState<any[]>([]);
  const [stuurkunstSubjects, setStuurkunstSubjects] = useState<any[]>([]);
  const [allTests, setAllTests] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<Record<string, any>>({});

  useEffect(() => {
    if (!user) return;

    const loadData = async () => {
      setLoading(true);

      try {
        // Load all tests first
        const testsData = await getAllTests();
        setAllTests(testsData);
        
        // Load grades and test completions
        const grades = await getStudentGrades(user.id);
        setStudentGrades(grades);

        const tests = await getStudentTests(user.id);
        setStudentTests(tests);

        // Load category feedback - changed to get the last 5 feedback items
        const vFeedback = await getStudentCategoryFeedback(user.id, CATEGORIES.VERRICHTINGEN);
        setVerrichtingenFeedback(vFeedback.slice(0, 5)); // Limit to 5 most recent

        const rFeedback = await getStudentCategoryFeedback(user.id, CATEGORIES.ROEITECHNIEK);
        setRoeitechniekFeedback(rFeedback.slice(0, 5)); // Limit to 5 most recent
        
        const sFeedback = await getStudentCategoryFeedback(user.id, CATEGORIES.STUURKUNST);
        setStuurkunstFeedback(sFeedback.slice(0, 5)); // Limit to 5 most recent

        // Load test completion counts
        const counts: Record<number, number> = {};
        for (const test of testsData) {
          const count = await getStudentTestCompletionCount(user.id, test.id);
          counts[test.id] = count;
        }
        setTestCompletionCounts(counts);
        
        // Load subjects by category
        const vSubjects = await getSubjectsByCategory(CATEGORIES.VERRICHTINGEN);
        setVerrichtingenSubjects(vSubjects);
        
        const rSubjects = await getSubjectsByCategory(CATEGORIES.ROEITECHNIEK);
        setRoeitechniekSubjects(rSubjects);
        
        const sSubjects = await getSubjectsByCategory(CATEGORIES.STUURKUNST);
        setStuurkunstSubjects(sSubjects);
        
        // Load teacher details for feedback
        const teacherIds = new Set<string>();
        vFeedback.forEach(fb => { if (fb.teacher_id) teacherIds.add(fb.teacher_id); });
        rFeedback.forEach(fb => { if (fb.teacher_id) teacherIds.add(fb.teacher_id); });
        sFeedback.forEach(fb => { if (fb.teacher_id) teacherIds.add(fb.teacher_id); });
        
        const teacherDetails: Record<string, any> = {};
        for (const teacherId of teacherIds) {
          const teacher = await getUserById(teacherId);
          if (teacher) teacherDetails[teacherId] = teacher;
        }
        setTeachers(teacherDetails);
        
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      }

      setLoading(false);
    };

    loadData();
  }, [user]);

  if (!user) return null;

  const studentId = user.id;
  
  const countGradesByValue = (grades: typeof studentGrades) => {
    const counts = { 1: 0, 2: 0, 3: 0 };
    grades.forEach(grade => counts[grade.grade as keyof typeof counts]++);
    return [
      { name: 'Verbetering nodig', value: counts[1], color: '#FECACA' },
      { name: 'OK voor nu', value: counts[2], color: '#FDE68A' },
      { name: 'Op koers', value: counts[3], color: '#A7F3D0' },
    ];
  };
  
  // Helper function to get the appropriate color for test completions
  const getTestCompletionColor = (count: number) => {
    if (count >= 2) return 'bg-green-100 text-green-800 border-green-200';
    if (count === 1) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-gray-100 text-gray-500 border-gray-200';
  };

  const gradeDistribution = countGradesByValue(studentGrades);
  const totalTestCompletions = studentTests.filter(test => test.completed).length;
  
  if (loading) {
    return (
      <DashboardLayout allowedRoles={['student']}>
        <div className="container py-6">
          <div className="flex items-center justify-center h-64">
            <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <span className="ml-3">Gegevens laden...</span>
          </div>
        </div>
      </DashboardLayout>
    );
  }
  
  const getTeacherName = (teacherId: string) => {
    return teachers[teacherId]?.name || 'Instructeur';
  };
  
  return (
    <DashboardLayout allowedRoles={['student']}>
      <div className="container py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium">Totale Voortgang</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-3xl font-semibold mb-1">
                {studentGrades.length}
              </div>
              <p className="text-sm text-muted-foreground">
                Totaal beoordelingen
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium">Bruggen afgetekend</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-3xl font-semibold mb-1">
                {totalTestCompletions}
              </div>
              <p className="text-sm text-muted-foreground">
                Totaal bruggen gedaan
              </p>
            </CardContent>
          </Card>
          
          <GradeChart 
            grades={gradeDistribution} 
            title="Beoordeling Verdeling" 
          />
        </div>
        
        <Tabs 
          value={activeTab} 
          onValueChange={(value) => setActiveTab(value as CategoryEnum)} 
          className="space-y-4"
        >
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value={CATEGORIES.VERRICHTINGEN}>Verrichtingen</TabsTrigger>
            <TabsTrigger value={CATEGORIES.ROEITECHNIEK}>Roeitechniek</TabsTrigger>
            <TabsTrigger value={CATEGORIES.STUURKUNST}>Stuurkunst</TabsTrigger>
          </TabsList>
          
          <TabsContent value={CATEGORIES.VERRICHTINGEN} className="space-y-4">
            {verrichtingenFeedback.length > 0 && (
              <Card className="mb-4">
                <CardHeader>
                  <CardTitle className="text-base">Feedback - Verrichtingen</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {verrichtingenFeedback.map((feedback) => (
                    <FeedbackItem 
                      key={feedback.id}
                      feedback={feedback.feedback} 
                      date={feedback.date}
                      teacherName={getTeacherName(feedback.teacher_id)}
                    />
                  ))}
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
            {roeitechniekFeedback.length > 0 && (
              <Card className="mb-4">
                <CardHeader>
                  <CardTitle className="text-base">Feedback - Roeitechniek</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {roeitechniekFeedback.map((feedback) => (
                    <FeedbackItem 
                      key={feedback.id}
                      feedback={feedback.feedback} 
                      date={feedback.date}
                      teacherName={getTeacherName(feedback.teacher_id)}
                    />
                  ))}
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
            {stuurkunstFeedback.length > 0 && (
              <Card className="mb-4">
                <CardHeader>
                  <CardTitle className="text-base">Feedback - Stuurkunst</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {stuurkunstFeedback.map((feedback) => (
                    <FeedbackItem 
                      key={feedback.id}
                      feedback={feedback.feedback} 
                      date={feedback.date}
                      teacherName={getTeacherName(feedback.teacher_id)}
                    />
                  ))}
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
          <h2 className="text-lg font-medium mb-4">Bruggen afgetekend</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {allTests.map((test) => {
              const completionCount = testCompletionCounts[test.id] || 0;
              // Set color based on completion count
              const cardClass = completionCount >= 2 ? 'border-green-100 bg-green-50/50' : 
                               completionCount === 1 ? 'border-yellow-100 bg-yellow-50/50' : '';
              
              return (
                <Card key={test.id} className={`transition-colors ${cardClass}`}>
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {completionCount > 0 ? (
                        <CheckCircle2 className={`h-5 w-5 ${completionCount >= 2 ? 'text-green-500' : 'text-yellow-500'}`} />
                      ) : (
                        <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
                      )}
                      <div>
                        <p className="font-medium">{test.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {completionCount > 0 ? (
                            <span>{completionCount} keer gedaan</span>
                          ) : (
                            <span>Nog niet gedaan</span>
                          )}
                        </p>
                      </div>
                    </div>
                    {completionCount > 0 && (
                      <Badge variant="outline" className={getTestCompletionColor(completionCount)}>
                        {completionCount} {completionCount === 1 ? 'keer' : 'keer'}
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
