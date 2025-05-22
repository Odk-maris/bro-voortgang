
import { useState, useEffect } from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import { useAuth } from '@/context/AuthContext';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import {
  getStudentsByRole,
  getStudentGrades,
  getStudentTests,
  getSubjectsByCategory,
  getUserById,
  getStudentCategoryFeedback,
  getStudentTestCompletionCounts,
  getAllTests,
  CATEGORIES,
} from '@/utils/supabaseData';
import { getGradeLabel, getTestCompletionColor } from '@/integrations/supabase/client';
import FeedbackItem from '@/components/FeedbackItem';

const TeacherHistory = () => {
  const { user } = useAuth();
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [activeTab, setActiveTab] = useState(CATEGORIES.VERRICHTINGEN);
  
  const [students, setStudents] = useState<any[]>([]);
  const [studentGrades, setStudentGrades] = useState<any[]>([]);
  const [studentTests, setStudentTests] = useState<any[]>([]);
  const [tests, setTests] = useState<any[]>([]);
  const [testCompletionCounts, setTestCompletionCounts] = useState<Record<number, number>>({});
  const [verrichtingenSubjects, setVerrichtingenSubjects] = useState<any[]>([]);
  const [roeitechniekSubjects, setRoeitechniekSubjects] = useState<any[]>([]);
  const [stuurkunstSubjects, setStuurkunstSubjects] = useState<any[]>([]);
  const [verrichtingenFeedback, setVerrichtingenFeedback] = useState<any[]>([]);
  const [roeitechniekFeedback, setRoeitechniekFeedback] = useState<any[]>([]);
  const [stuurkunstFeedback, setStuurkunstFeedback] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [teacherCache, setTeacherCache] = useState<Record<string, any>>({});

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      try {
        const fetchedStudents = await getStudentsByRole('student');
        // Sort students alphabetically by name
        const sortedStudents = fetchedStudents.sort((a, b) => 
          a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
        );
        setStudents(sortedStudents);
        
        const sortSubjects = (subjects: any[]) => {
          return subjects.sort((a, b) => a.id - b.id);
        };
        
        const fetchedVerrichtingenSubjects = await getSubjectsByCategory(CATEGORIES.VERRICHTINGEN);
        setVerrichtingenSubjects(sortSubjects(fetchedVerrichtingenSubjects.filter(subject => subject.active)));
        
        const fetchedRoeitechniekSubjects = await getSubjectsByCategory(CATEGORIES.ROEITECHNIEK);
        setRoeitechniekSubjects(sortSubjects(fetchedRoeitechniekSubjects.filter(subject => subject.active)));
        
        const fetchedStuurkunstSubjects = await getSubjectsByCategory(CATEGORIES.STUURKUNST);
        setStuurkunstSubjects(sortSubjects(fetchedStuurkunstSubjects.filter(subject => subject.active)));
        
        const allTests = await getAllTests();
        const sortedTests = allTests.sort((a, b) => a.id - b.id);
        setTests(sortedTests);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadInitialData();
  }, []);
  
  // Load student-specific data when a student is selected
  useEffect(() => {
    if (!selectedStudentId) return;
    
    const loadStudentData = async () => {
      setLoading(true);
      try {
        const grades = await getStudentGrades(selectedStudentId);
        setStudentGrades(grades);
        
        const tests = await getStudentTests(selectedStudentId);
        setStudentTests(tests);
        
        const vFeedback = await getStudentCategoryFeedback(selectedStudentId, CATEGORIES.VERRICHTINGEN);
        setVerrichtingenFeedback(vFeedback);
        
        const rFeedback = await getStudentCategoryFeedback(selectedStudentId, CATEGORIES.ROEITECHNIEK);
        setRoeitechniekFeedback(rFeedback);
        
        const sFeedback = await getStudentCategoryFeedback(selectedStudentId, CATEGORIES.STUURKUNST);
        setStuurkunstFeedback(sFeedback);
        
        const completionCounts = await getStudentTestCompletionCounts(selectedStudentId);
        setTestCompletionCounts(completionCounts);
      } catch (error) {
        console.error('Error loading student data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadStudentData();
  }, [selectedStudentId]);
  
  const handleStudentChange = (value: string) => {
    setSelectedStudentId(value);
  };

  // Function to get grades for a subject
  const getSubjectGrades = (subjectId: number) => {
    return studentGrades
      .filter(grade => grade.subject_id === subjectId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  // Get teacher names for feedback display
  const getTeacherName = async (teacherId: string) => {
    if (teacherCache[teacherId]) {
      return teacherCache[teacherId].name;
    }
    
    try {
      const teacher = await getUserById(teacherId);
      if (teacher) {
        setTeacherCache(prev => ({
          ...prev,
          [teacherId]: teacher
        }));
        return teacher.name;
      }
    } catch (error) {
      console.error('Error fetching teacher:', error);
    }
    
    return 'Onbekende instructeur';
  };

  // Function to get the appropriate badge color for test completions
  const getTestCompletionBadgeClass = (count: number) => {
    if (count >= 2) return 'bg-green-100 text-green-800 border-green-200';
    if (count === 1) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-gray-100 text-gray-500 border-gray-200';
  };

  if (loading && !selectedStudentId) {
    return (
      <DashboardLayout allowedRoles={['teacher', 'admin']}>
        <div className="container py-6">
          <div className="flex justify-center items-center h-64">
            <div className="h-8 w-8 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout allowedRoles={['teacher', 'admin']}>
      <div className="container py-6">
        <h1 className="text-2xl font-semibold mb-6">Cursist Geschiedenis</h1>
        
        <div className="mb-6">
          <Label htmlFor="student-select" className="block mb-2">
            Kies Cursist
          </Label>
          <Select value={selectedStudentId} onValueChange={handleStudentChange}>
            <SelectTrigger id="student-select" className="w-full md:w-80">
              <SelectValue placeholder="Kies cursist" />
            </SelectTrigger>
            <SelectContent>
              {students.map((student) => (
                <SelectItem key={student.id} value={student.id}>
                  {student.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Grading Legend Card */}
        <div className="mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  <Badge className="bg-red-100 text-red-700 border-red-200">1</Badge>
                  <span>Nog te verbeteren</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">2</Badge>
                  <span>OK voor nu (acceptabel)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-green-100 text-green-700 border-green-200">3</Badge>
                  <span>Op koers (goed)</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {selectedStudentId && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Beoordelingen & Feedback Geschiedenis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as typeof activeTab)} className="space-y-4">
                      <TabsList className="grid grid-cols-3">
                        <TabsTrigger value={CATEGORIES.VERRICHTINGEN}>Verrichtingen</TabsTrigger>
                        <TabsTrigger value={CATEGORIES.ROEITECHNIEK}>Roeitechniek</TabsTrigger>
                        <TabsTrigger value={CATEGORIES.STUURKUNST}>Stuurkunst</TabsTrigger>
                      </TabsList>

                      <AnimatePresence>
                        {activeTab === CATEGORIES.VERRICHTINGEN && (
                          <TabsContent 
                            value={CATEGORIES.VERRICHTINGEN} 
                            className="space-y-6"
                          >
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              transition={{ duration: 0.2 }}
                            >
                              {/* Category Feedback Section */}
                              {verrichtingenFeedback.length > 0 && (
                                <div className="border rounded-lg p-4 mb-6">
                                  <h3 className="font-medium mb-3">Feedback</h3>
                                  <div className="space-y-4">
                                    {verrichtingenFeedback.map((feedback) => (
                                      <div key={feedback.id} className="border-t pt-3">
                                        <FeedbackItem 
                                          feedback={feedback.feedback} 
                                          date={feedback.date} 
                                          teacherName={teacherCache[feedback.teacher_id]?.name || 'Instructeur'}
                                        />
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            
                              {/* Subjects Section */}
                              {verrichtingenSubjects.map((subject) => {
                                const subjectGrades = getSubjectGrades(subject.id);
                                if (subjectGrades.length === 0) return null;
                                
                                return (
                                  <div key={subject.id} className="border rounded-lg p-4">
                                    <div className="flex items-center justify-between mb-4">
                                      <div>
                                        <h3 className="font-medium">{subject.name}</h3>
                                        <Badge variant="outline" className="mt-1 bg-blue-100 text-blue-800 border-blue-200">
                                          {subject.category}
                                        </Badge>
                                      </div>
                                      <Badge variant="outline" className="text-sm">
                                        {subjectGrades.length} beoordeling{subjectGrades.length !== 1 ? 'en' : ''}
                                      </Badge>
                                    </div>
                                    
                                    <div className="space-y-3">
                                      {subjectGrades.map((grade) => (
                                        <div key={grade.id} className="border-t pt-3">
                                          <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                              <Badge 
                                                className={`
                                                  ${grade.grade === 1 ? 'bg-red-100 text-red-700 border-red-200' : ''}
                                                  ${grade.grade === 2 ? 'bg-yellow-100 text-yellow-700 border-yellow-200' : ''}
                                                  ${grade.grade === 3 ? 'bg-green-100 text-green-700 border-green-200' : ''}
                                                `}
                                              >
                                                Beoordeling: {grade.grade}
                                              </Badge>
                                              <span className="text-sm text-muted-foreground">
                                                {new Date(grade.date).toLocaleDateString()}
                                              </span>
                                            </div>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                );
                              })}
                            </motion.div>
                          </TabsContent>
                        )}

                        {activeTab === CATEGORIES.ROEITECHNIEK && (
                          <TabsContent 
                            value={CATEGORIES.ROEITECHNIEK} 
                            className="space-y-6"
                          >
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              transition={{ duration: 0.2 }}
                            >
                              {/* Category Feedback Section */}
                              {roeitechniekFeedback.length > 0 && (
                                <div className="border rounded-lg p-4 mb-6">
                                  <h3 className="font-medium mb-3">Feedback</h3>
                                  <div className="space-y-4">
                                    {roeitechniekFeedback.map((feedback) => (
                                      <div key={feedback.id} className="border-t pt-3">
                                        <FeedbackItem 
                                          feedback={feedback.feedback} 
                                          date={feedback.date} 
                                          teacherName={teacherCache[feedback.teacher_id]?.name || 'Instructeur'} 
                                        />
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            
                              {/* Subjects Section */}
                              {roeitechniekSubjects.map((subject) => {
                                const subjectGrades = getSubjectGrades(subject.id);
                                if (subjectGrades.length === 0) return null;
                                
                                return (
                                  <div key={subject.id} className="border rounded-lg p-4">
                                    <div className="flex items-center justify-between mb-4">
                                      <div>
                                        <h3 className="font-medium">{subject.name}</h3>
                                        <Badge variant="outline" className="mt-1 bg-green-100 text-green-800 border-green-200">
                                          {subject.category}
                                        </Badge>
                                      </div>
                                      <Badge variant="outline" className="text-sm">
                                        {subjectGrades.length} beoordeling{subjectGrades.length !== 1 ? 'en' : ''}
                                      </Badge>
                                    </div>
                                    
                                    <div className="space-y-3">
                                      {subjectGrades.map((grade) => (
                                        <div key={grade.id} className="border-t pt-3">
                                          <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                              <Badge 
                                                className={`
                                                  ${grade.grade === 1 ? 'bg-red-100 text-red-700 border-red-200' : ''}
                                                  ${grade.grade === 2 ? 'bg-yellow-100 text-yellow-700 border-yellow-200' : ''}
                                                  ${grade.grade === 3 ? 'bg-green-100 text-green-700 border-green-200' : ''}
                                                `}
                                              >
                                                Beoordeling: {grade.grade}
                                              </Badge>
                                              <span className="text-sm text-muted-foreground">
                                                {new Date(grade.date).toLocaleDateString()}
                                              </span>
                                            </div>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                );
                              })}
                            </motion.div>
                          </TabsContent>
                        )}

                        {activeTab === CATEGORIES.STUURKUNST && (
                          <TabsContent 
                            value={CATEGORIES.STUURKUNST} 
                            className="space-y-6"
                          >
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              transition={{ duration: 0.2 }}
                            >
                              {/* Category Feedback Section */}
                              {stuurkunstFeedback.length > 0 && (
                                <div className="border rounded-lg p-4 mb-6">
                                  <h3 className="font-medium mb-3">Feedback</h3>
                                  <div className="space-y-4">
                                    {stuurkunstFeedback.map((feedback) => (
                                      <div key={feedback.id} className="border-t pt-3">
                                        <FeedbackItem 
                                          feedback={feedback.feedback} 
                                          date={feedback.date} 
                                          teacherName={teacherCache[feedback.teacher_id]?.name || 'Instructeur'} 
                                        />
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            
                              {/* Subjects Section */}
                              {stuurkunstSubjects.map((subject) => {
                                const subjectGrades = getSubjectGrades(subject.id);
                                if (subjectGrades.length === 0) return null;
                                
                                return (
                                  <div key={subject.id} className="border rounded-lg p-4">
                                    <div className="flex items-center justify-between mb-4">
                                      <div>
                                        <h3 className="font-medium">{subject.name}</h3>
                                        <Badge variant="outline" className="mt-1 bg-purple-100 text-purple-800 border-purple-200">
                                          {subject.category}
                                        </Badge>
                                      </div>
                                      <Badge variant="outline" className="text-sm">
                                        {subjectGrades.length} beoordeling{subjectGrades.length !== 1 ? 'en' : ''}
                                      </Badge>
                                    </div>
                                    
                                    <div className="space-y-3">
                                      {subjectGrades.map((grade) => (
                                        <div key={grade.id} className="border-t pt-3">
                                          <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                              <Badge 
                                                className={`
                                                  ${grade.grade === 1 ? 'bg-red-100 text-red-700 border-red-200' : ''}
                                                  ${grade.grade === 2 ? 'bg-yellow-100 text-yellow-700 border-yellow-200' : ''}
                                                  ${grade.grade === 3 ? 'bg-green-100 text-green-700 border-green-200' : ''}
                                                `}
                                              >
                                                Beoordeling: {grade.grade}
                                              </Badge>
                                              <span className="text-sm text-muted-foreground">
                                                {new Date(grade.date).toLocaleDateString()}
                                              </span>
                                            </div>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                );
                              })}
                            </motion.div>
                          </TabsContent>
                        )}
                      </AnimatePresence>
                    </Tabs>
                  </CardContent>
                </Card>
              </div>
              
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle>Bruggen afgetekend</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {tests.map((test) => (
                        <div key={test.id} className="flex items-center justify-between border rounded-lg p-3">
                          <div>
                            <p className="font-medium">{test.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {testCompletionCounts[test.id] > 0 
                                ? `${testCompletionCounts[test.id]} keer gedaan` 
                                : 'Nog niet gedaan'}
                            </p>
                          </div>
                          
                          <Badge
                            variant="outline"
                            className={getTestCompletionBadgeClass(testCompletionCounts[test.id] || 0)}
                          >
                            {testCompletionCounts[test.id] > 0 ? `${testCompletionCounts[test.id]} keer` : 'Nog niet'}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default TeacherHistory;
