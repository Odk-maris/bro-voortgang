import { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import { useAuth } from '@/context/AuthContext';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import {
  getStudentsByRole,
  getSubjectsByCategory,
  getUserById,
  addGrade,
  addTestCompletion,
  getStudentTestCompletionCount,
  getAllTests,
  CATEGORIES,
  addCategoryFeedback,
} from '@/utils/supabaseData';
import { CategoryEnum, supabase, getGradeLabel, getTestCompletionColor } from '@/integrations/supabase/client';

const TeacherDashboard = () => {
  const { user } = useAuth();
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<CategoryEnum>(CATEGORIES.VERRICHTINGEN);
  const [selectedGrades, setSelectedGrades] = useState<Record<number, number>>({});
  const [categoryFeedback, setCategoryFeedback] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [selectedTests, setSelectedTests] = useState<Record<number, boolean>>({});
  const [testCompletionCounts, setTestCompletionCounts] = useState<Record<number, number>>({});
  const [students, setStudents] = useState<any[]>([]);
  const [subjects, setSubjects] = useState({
    [CATEGORIES.VERRICHTINGEN]: [],
    [CATEGORIES.ROEITECHNIEK]: [],
    [CATEGORIES.STUURKUNST]: []
  });
  const [tests, setTests] = useState<any[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [saveStatus, setSaveStatus] = useState<{
    grades: Record<number, boolean>,
    tests: Record<number, boolean>,
    feedback: Record<string, boolean>
  }>({
    grades: {},
    tests: {},
    feedback: {}
  });

  useEffect(() => {
    const loadData = async () => {
      setDataLoading(true);
      try {
        console.log('Loading initial data');
        const fetchedStudents = await getStudentsByRole('student');
        // Sort students alphabetically by name
        const sortedStudents = fetchedStudents.sort((a, b) => 
          a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
        );
        setStudents(sortedStudents);

        const verrichtingenSubjects = await getSubjectsByCategory(CATEGORIES.VERRICHTINGEN);
        const roeitechniekSubjects = await getSubjectsByCategory(CATEGORIES.ROEITECHNIEK);
        const stuurkunstSubjects = await getSubjectsByCategory(CATEGORIES.STUURKUNST);
        
        // Sort subjects by ID to maintain consistent order
        const sortSubjects = (subjects: any[]) => {
          return subjects.sort((a, b) => a.id - b.id);
        };
        
        setSubjects({
          [CATEGORIES.VERRICHTINGEN]: sortSubjects(verrichtingenSubjects.filter(subject => subject.active)),
          [CATEGORIES.ROEITECHNIEK]: sortSubjects(roeitechniekSubjects.filter(subject => subject.active)),
          [CATEGORIES.STUURKUNST]: sortSubjects(stuurkunstSubjects.filter(subject => subject.active))
        });

        const allTests = await getAllTests();
        // Sort tests by ID for consistency
        const sortedTests = allTests.sort((a, b) => a.id - b.id);
        setTests(sortedTests);
        console.log('Initial data loaded successfully', { students: fetchedStudents.length, tests: sortedTests.length });
      } catch (error) {
        console.error('Error loading initial data:', error);
        toast.error('Failed to load data');
      } finally {
        setDataLoading(false);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    if (selectedStudentId) {
      const loadSelectedStudentData = async () => {
        setLoading(true);
        try {
          console.log('Loading selected student data:', selectedStudentId);
          const student = await getUserById(selectedStudentId);
          setSelectedStudent(student);

          const counts: Record<number, number> = {};
          for (const test of tests) {
            const count = await getStudentTestCompletionCount(selectedStudentId, test.id);
            counts[test.id] = count;
          }
          setTestCompletionCounts(counts);
          
          const initialTestState: Record<number, boolean> = {};
          tests.forEach(test => {
            initialTestState[test.id] = false;
          });
          setSelectedTests(initialTestState);
          
          setCategoryFeedback({
            [CATEGORIES.VERRICHTINGEN]: '',
            [CATEGORIES.ROEITECHNIEK]: '',
            [CATEGORIES.STUURKUNST]: ''
          });
          
          console.log('Student data loaded successfully', { student, testCompletions: counts });
        } catch (error) {
          console.error('Error loading student data:', error);
          toast.error('Failed to load student data');
        } finally {
          setLoading(false);
        }
      };
      
      loadSelectedStudentData();
    }
  }, [selectedStudentId, tests]);

  const handleStudentChange = (value: string) => {
    setSelectedStudentId(value);
    setSelectedGrades({});
  };

  const handleGradeChange = (subjectId: number, grade: number) => {
    setSelectedGrades(prev => ({
      ...prev,
      [subjectId]: grade
    }));
  };

  const handleCategoryFeedbackChange = (category: CategoryEnum, value: string) => {
    setCategoryFeedback(prev => ({
      ...prev,
      [category]: value
    }));
  };

  const handleTestChange = (testId: number, checked: boolean) => {
    setSelectedTests(prev => ({
      ...prev,
      [testId]: checked
    }));
  };

  const saveGrade = useCallback(async (subjectId: number, grade: number, userId: string) => {
    try {
      console.log(`Saving grade for subject ${subjectId}: ${grade}`);
      const success = await addGrade(selectedStudentId, subjectId, grade, userId, '');
      
      if (success) {
        return true;
      }
      return false;
    } catch (error) {
      console.error(`Error saving grade for subject ${subjectId}:`, error);
      return false;
    }
  }, [selectedStudentId]);

  const saveTest = useCallback(async (testId: number, isCompleted: boolean) => {
    try {
      console.log(`Saving test completion for test ${testId}`);
      const success = await addTestCompletion(selectedStudentId, testId, isCompleted);
      
      if (success) {
        return true;
      }
      return false;
    } catch (error) {
      console.error(`Error saving test completion for test ${testId}:`, error);
      return false;
    }
  }, [selectedStudentId]);

  const saveFeedback = useCallback(async (category: CategoryEnum, feedback: string, userId: string) => {
    if (!feedback.trim()) return true; // Skip empty feedback
    
    try {
      console.log(`Saving feedback for category ${category}`);
      const success = await addCategoryFeedback(selectedStudentId, category, feedback, userId);
      
      if (success) {
        return true;
      }
      return false;
    } catch (error) {
      console.error(`Error saving feedback for category ${category}:`, error);
      return false;
    }
  }, [selectedStudentId]);

  const resetForm = () => {
    // Reset grades
    setSelectedGrades({});
    
    // Reset feedback for all categories
    setCategoryFeedback({
      [CATEGORIES.VERRICHTINGEN]: '',
      [CATEGORIES.ROEITECHNIEK]: '',
      [CATEGORIES.STUURKUNST]: ''
    });
    
    // Reset test selections
    const initialTestState: Record<number, boolean> = {};
    tests.forEach(test => {
      initialTestState[test.id] = false;
    });
    setSelectedTests(initialTestState);
    
    // Reset save status
    setSaveStatus({
      grades: {},
      tests: {},
      feedback: {}
    });
  };

  const handleSaveGrades = async () => {
    if (!selectedStudentId) {
      toast.error('Selecteer een cursist');
      return;
    }

    if (!user?.id) {
      toast.error('Teacher ID not found');
      return;
    }
    
    console.log('Saving data with user ID:', user.id);
    console.log('Selected grades:', selectedGrades);
    console.log('Category feedback:', categoryFeedback);
    console.log('Selected tests:', selectedTests);
    
    setLoading(true);
    
    try {
      // Check Supabase session
      const { data: sessionData } = await supabase.auth.getSession();
      console.log('Current Supabase session:', sessionData);
      
      // Reset save status
      setSaveStatus({
        grades: {},
        tests: {},
        feedback: {}
      });
      
      // Save each grade individually for better error tracking
      let gradesSaved = 0;
      for (const [subjectId, grade] of Object.entries(selectedGrades)) {
        const subjectIdNum = parseInt(subjectId);
        const success = await saveGrade(subjectIdNum, grade, user.id);
        
        setSaveStatus(prev => ({
          ...prev,
          grades: {
            ...prev.grades,
            [subjectIdNum]: success
          }
        }));
        
        if (success) {
          gradesSaved++;
        }
      }
      
      // Save feedback for each category if it's not empty
      let feedbackSaved = 0;
      for (const [category, feedback] of Object.entries(categoryFeedback)) {
        if (feedback.trim()) {
          const success = await saveFeedback(category as CategoryEnum, feedback, user.id);
          
          setSaveStatus(prev => ({
            ...prev,
            feedback: {
              ...prev.feedback,
              [category]: success
            }
          }));
          
          if (success) {
            feedbackSaved++;
          }
        }
      }
      
      // Save test completions
      let testsSaved = 0;
      for (const [testId, isCompleted] of Object.entries(selectedTests)) {
        if (isCompleted) {
          const testIdNum = parseInt(testId);
          const success = await saveTest(testIdNum, true);
          
          setSaveStatus(prev => ({
            ...prev,
            tests: {
              ...prev.tests,
              [testIdNum]: success
            }
          }));
          
          if (success) {
            testsSaved++;
          }
        }
      }

      const totalSaved = gradesSaved + feedbackSaved + testsSaved;
      if (totalSaved > 0) {
        toast.success('Succesvol opgeslagen', {
          description: `${gradesSaved} beoordelingen, ${feedbackSaved} feedback en ${testsSaved} bruggen zijn bijgewerkt.`,
        });
        
        // Reset the form after successful save
        resetForm();
        
        // Update test completion counts
        if (selectedStudentId) {
          const counts: Record<number, number> = {};
          for (const test of tests) {
            const count = await getStudentTestCompletionCount(selectedStudentId, test.id);
            counts[test.id] = count;
          }
          setTestCompletionCounts(counts);
        }
      } else {
        toast.info('Geen wijzigingen', {
          description: 'Er zijn geen wijzigingen aangebracht om op te slaan.',
        });
      }
    } catch (error) {
      console.error('Error saving data:', error);
      toast.error('Opslaan mislukt', {
        description: 'Er is een fout opgetreden bij het opslaan van de gegevens. Probeer het opnieuw.',
      });
    } finally {
      setLoading(false);
    }
  };

  const currentSubjects = subjects[activeTab] || [];

  if (dataLoading) {
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
        <h1 className="text-2xl font-semibold mb-6">Beoordeling invullen</h1>
        
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
                <SelectItem key={student.id} value={student.id.toString()}>
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
            {selectedStudent && (
              <div className="mb-4 flex items-center">
                <h2 className="text-xl">{selectedStudent.name}</h2>
                {selectedStudent.role === 'student' && selectedStudent.groep && selectedStudent.groep !== 'none' && (
                  <Badge variant="outline" className="ml-3 bg-purple-100 text-purple-800 border-purple-200">
                    Groep: {selectedStudent.groep}
                  </Badge>
                )}
              </div>
            )}
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Onderdelen beoordelen</CardTitle>
                  </CardHeader>
                  <CardContent>
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

                      <AnimatePresence mode="wait">
                        <TabsContent 
                          value={activeTab} 
                          className="space-y-4"
                          asChild
                        >
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            {currentSubjects.map((subject) => (
                              <div key={subject.id} className="border rounded-lg p-4">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-3">
                                  <div>
                                    <h3 className="font-medium">{subject.name}</h3>
                                    <div className="flex items-center gap-2 mt-1">
                                      <Badge 
                                        variant="outline" 
                                        className={activeTab === CATEGORIES.VERRICHTINGEN ? 
                                          "bg-blue-100 text-blue-800 border-blue-200" : 
                                          activeTab === CATEGORIES.ROEITECHNIEK ? 
                                            "bg-green-100 text-green-800 border-green-200" : 
                                            "bg-purple-100 text-purple-800 border-purple-200"}
                                      >
                                        {subject.category}
                                      </Badge>
                                    </div>
                                  </div>
                                  
                                  <div className="flex-shrink-0">
                                    <RadioGroup
                                      value={selectedGrades[subject.id]?.toString() || ""}
                                      onValueChange={(value) => handleGradeChange(subject.id, parseInt(value))}
                                      className="flex items-center space-x-2"
                                    >
                                      <div className="flex items-center space-x-1">
                                        <RadioGroupItem value="1" id={`grade-1-${subject.id}`} className="text-red-500" />
                                        <Label htmlFor={`grade-1-${subject.id}`} className="text-sm">1</Label>
                                      </div>
                                      <div className="flex items-center space-x-1">
                                        <RadioGroupItem value="2" id={`grade-2-${subject.id}`} className="text-yellow-500" />
                                        <Label htmlFor={`grade-2-${subject.id}`} className="text-sm">2</Label>
                                      </div>
                                      <div className="flex items-center space-x-1">
                                        <RadioGroupItem value="3" id={`grade-3-${subject.id}`} className="text-green-500" />
                                        <Label htmlFor={`grade-3-${subject.id}`} className="text-sm">3</Label>
                                      </div>
                                    </RadioGroup>
                                  </div>
                                </div>
                              </div>
                            ))}
                            
                            <div className="border rounded-lg p-4 mt-6">
                              <h3 className="font-medium mb-2">Feedback voor {activeTab}</h3>
                              <Textarea
                                placeholder="Vul hier je feedback in als je iets wilt delen met de cursist."
                                value={categoryFeedback[activeTab] || ''}
                                onChange={(e) => handleCategoryFeedbackChange(activeTab, e.target.value)}
                                className="resize-none h-32"
                              />
                            </div>
                          </motion.div>
                        </TabsContent>
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
                      {tests.map((test) => {
                        const completionCount = testCompletionCounts[test.id] || 0;
                        return (
                          <div key={test.id} className="flex items-start space-x-3">
                            <div className="flex items-center space-x-2 pt-1">
                              <Checkbox 
                                id={`test-${test.id}`} 
                                checked={selectedTests[test.id] || false}
                                onCheckedChange={(checked) => handleTestChange(test.id, checked === true)}
                              />
                            </div>
                            <div className="grid gap-1.5 leading-none">
                              <Label
                                htmlFor={`test-${test.id}`}
                                className="text-sm font-medium leading-none cursor-pointer"
                              >
                                {test.name}
                              </Label>
                              {selectedStudentId && completionCount > 0 && (
                                <Badge variant="outline" className="mt-1 text-xs bg-green-100 text-green-800 border-green-200 w-fit">
                                  {completionCount} keer gedaan
                                </Badge>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <Button 
                onClick={handleSaveGrades} 
                disabled={loading}
                className="w-full md:w-auto"
              >
                {loading ? (
                  <>
                    <span className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2"></span>
                    Opslaan...
                  </>
                ) : 'Voortgang opslaan'}
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default TeacherDashboard;
