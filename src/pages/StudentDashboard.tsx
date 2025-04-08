
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
  getStudentLatestCategoryFeedback,
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
  const [verrichtingenFeedback, setVerrichtingenFeedback] = useState<any>(null);
  const [roeitechniekFeedback, setRoeitechniekFeedback] = useState<any>(null);
  const [stuurkunstFeedback, setStuurkunstFeedback] = useState<any>(null);
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

        // Load category feedback
        const vFeedback = await getStudentLatestCategoryFeedback(user.id, CATEGORIES.VERRICHTINGEN);
        setVerrichtingenFeedback(vFeedback);

        const rFeedback = await getStudentLatestCategoryFeedback(user.id, CATEGORIES.ROEITECHNIEK);
        setRoeitechniekFeedback(rFeedback);
        
        const sFeedback = await getStudentLatestCategoryFeedback(user.id, CATEGORIES.STUURKUNST);
        setStuurkunstFeedback(sFeedback);

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
        if (vFeedback?.teacher_id) teacherIds.add(vFeedback.teacher_id);
        if (rFeedback?.teacher_id) teacherIds.add(rFeedback.teacher_id);
        if (sFeedback?.teacher_id) teacherIds.add(sFeedback.teacher_id);
        
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
      { name: 'Voldoende', value: counts[2], color: '#FDE68A' },
      { name: 'Uitstekend', value: counts[3], color: '#A7F3D0' },
    ];
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
              <CardTitle className="text-base font-medium">Bruggen gedaan</CardTitle>
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
            {verrichtingenFeedback && (
              <Card className="mb-4">
                <CardHeader>
                  <CardTitle className="text-base">Feedback - Verrichtingen</CardTitle>
                </CardHeader>
                <CardContent>
                  <FeedbackItem 
                    feedback={verrichtingenFeedback.feedback} 
                    date={verrichtingenFeedback.date}
                    teacherName={getTeacherName(verrichtingenFeedback.teacher_id)}
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
                    teacherName={getTeacherName(roeitechniekFeedback.teacher_id)}
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
                    teacherName={getTeacherName(stuurkunstFeedback.teacher_id)}
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
          <h2 className="text-lg font-medium mb-4">Bruggen gedaan</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {allTests.map((test) => {
              const completionCount = testCompletionCounts[test.id] || 0;
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
                            <span>{completionCount} keer gedaan</span>
                          ) : (
                            <span>Nog niet gedaan</span>
                          )}
                        </p>
                      </div>
                    </div>
                    {completionCount > 0 && (
                      <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
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
