
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
  getStudentGrades,
  getStudentLatestGrades,
  addGrade,
  addTestCompletion,
  getStudentTests,
  getStudentTestCompletionCount,
  tests,
  CATEGORIES,
  getStudentCategoryFeedback,
  addCategoryFeedback,
} from '@/utils/mockData';

const TeacherDashboard = () => {
  const { user } = useAuth();
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [activeTab, setActiveTab] = useState(CATEGORIES.VERRICHTINGEN);
  const [selectedGrades, setSelectedGrades] = useState<Record<number, number>>({});
  const [categoryFeedback, setCategoryFeedback] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [selectedTests, setSelectedTests] = useState<Record<number, boolean>>({});

  const students = getStudentsByRole();

  useEffect(() => {
    if (selectedStudentId) {
      const studentId = parseInt(selectedStudentId);
      
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
    }
  }, [selectedStudentId]);

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

  const handleCategoryFeedbackChange = (category: string, value: string) => {
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

  const handleSaveGrades = async () => {
    if (!selectedStudentId) {
      toast.error('Selecteer een cursist');
      return;
    }

    const studentId = parseInt(selectedStudentId);
    setLoading(true);
    
    try {
      Object.entries(selectedGrades).forEach(([subjectId, grade]) => {
        addGrade(studentId, parseInt(subjectId), grade, user?.id || 0, '');
      });
      
      Object.entries(categoryFeedback).forEach(([category, feedback]) => {
        if (feedback.trim()) {
          addCategoryFeedback(studentId, category, feedback, user?.id || 0);
        }
      });
      
      Object.entries(selectedTests).forEach(([testId, isCompleted]) => {
        if (isCompleted) {
          addTestCompletion(studentId, parseInt(testId), true);
        }
      });

      toast.success('Succesvol opgeslagen', {
        description: 'De beoordelingen, feedback en bruggen zijn bijgewerkt.',
      });
      
      setSelectedGrades({});
      
      const resetTests: Record<number, boolean> = {};
      tests.forEach(test => {
        resetTests[test.id] = false;
      });
      setSelectedTests(resetTests);
      
    } catch (error) {
      toast.error('Opslaan mislukt', {
        description: 'Er is een fout opgetreden bij het opslaan van de gegevens. Probeer het opnieuw.',
      });
    } finally {
      setLoading(false);
    }
  };

  const verrichtingenSubjects = getSubjectsByCategory(CATEGORIES.VERRICHTINGEN).filter(subject => subject.active);
  const roeitechniekSubjects = getSubjectsByCategory(CATEGORIES.ROEITECHNIEK).filter(subject => subject.active);
  const stuurkunstSubjects = getSubjectsByCategory(CATEGORIES.STUURKUNST).filter(subject => subject.active);

  const selectedStudent = selectedStudentId ? getUserById(parseInt(selectedStudentId)) : null;

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
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                      <TabsList className="grid grid-cols-3">
                        <TabsTrigger value={CATEGORIES.VERRICHTINGEN}>Verrichtingen</TabsTrigger>
                        <TabsTrigger value={CATEGORIES.ROEITECHNIEK}>Roeitechniek</TabsTrigger>
                        <TabsTrigger value={CATEGORIES.STUURKUNST}>Stuurkunst</TabsTrigger>
                      </TabsList>

                      <AnimatePresence mode="wait">
                        <TabsContent 
                          value={CATEGORIES.VERRICHTINGEN} 
                          className="space-y-4"
                          asChild
                        >
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            {verrichtingenSubjects.map((subject) => (
                              <div key={subject.id} className="border rounded-lg p-4">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-3">
                                  <div>
                                    <h3 className="font-medium">{subject.name}</h3>
                                    <div className="flex items-center gap-2 mt-1">
                                      <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">
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
                              <h3 className="font-medium mb-2">Feedback voor Verrichtingen</h3>
                              <Textarea
                                placeholder="Vul hier je feedback in als je iets wilt delen met de cursist."
                                value={categoryFeedback[CATEGORIES.VERRICHTINGEN] || ''}
                                onChange={(e) => handleCategoryFeedbackChange(CATEGORIES.VERRICHTINGEN, e.target.value)}
                                className="resize-none h-32"
                              />
                            </div>
                          </motion.div>
                        </TabsContent>

                        <TabsContent 
                          value={CATEGORIES.ROEITECHNIEK} 
                          className="space-y-4"
                          asChild
                        >
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            {roeitechniekSubjects.map((subject) => (
                              <div key={subject.id} className="border rounded-lg p-4">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-3">
                                  <div>
                                    <h3 className="font-medium">{subject.name}</h3>
                                    <div className="flex items-center gap-2 mt-1">
                                      <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
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
                              <h3 className="font-medium mb-2">Feedback voor Roeitechniek</h3>
                              <Textarea
                                placeholder="Vul hier je feedback in als je iets wilt delen met de cursist."
                                value={categoryFeedback[CATEGORIES.ROEITECHNIEK] || ''}
                                onChange={(e) => handleCategoryFeedbackChange(CATEGORIES.ROEITECHNIEK, e.target.value)}
                                className="resize-none h-32"
                              />
                            </div>
                          </motion.div>
                        </TabsContent>

                        <TabsContent 
                          value={CATEGORIES.STUURKUNST} 
                          className="space-y-4"
                          asChild
                        >
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            {stuurkunstSubjects.map((subject) => (
                              <div key={subject.id} className="border rounded-lg p-4">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-3">
                                  <div>
                                    <h3 className="font-medium">{subject.name}</h3>
                                    <div className="flex items-center gap-2 mt-1">
                                      <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-200">
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
                              <h3 className="font-medium mb-2">Feedback voor Stuurkunst</h3>
                              <Textarea
                                placeholder="Vul hier je feedback in als je iets wilt delen met de cursist."
                                value={categoryFeedback[CATEGORIES.STUURKUNST] || ''}
                                onChange={(e) => handleCategoryFeedbackChange(CATEGORIES.STUURKUNST, e.target.value)}
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
                    <CardTitle>Bruggen gedaan</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {tests.map((test) => (
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
                            <p className="text-sm text-muted-foreground">
                              {test.description}
                            </p>
                            {getStudentTestCompletionCount(parseInt(selectedStudentId), test.id) > 0 && (
                              <Badge variant="outline" className="mt-1 text-xs bg-green-100 text-green-800 border-green-200 w-fit">
                                {getStudentTestCompletionCount(parseInt(selectedStudentId), test.id)} keer gedaan
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))}
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
