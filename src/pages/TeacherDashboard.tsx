
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
  updateTestCompletion,
  getStudentTests,
  tests,
  CATEGORIES,
} from '@/utils/mockData';

const TeacherDashboard = () => {
  const { user } = useAuth();
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [activeTab, setActiveTab] = useState(CATEGORIES.VERRICHTINGEN);
  const [selectedGrades, setSelectedGrades] = useState<Record<number, number>>({});
  const [feedback, setFeedback] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(false);
  const [completedTests, setCompletedTests] = useState<Record<number, boolean>>({});

  const students = getStudentsByRole();

  // Initialize completed tests when student changes
  useEffect(() => {
    if (selectedStudentId) {
      const studentId = parseInt(selectedStudentId);
      const studentTests = getStudentTests(studentId);
      
      const testStatus: Record<number, boolean> = {};
      studentTests.forEach(test => {
        testStatus[test.testId] = test.completed;
      });
      
      setCompletedTests(testStatus);
    }
  }, [selectedStudentId]);

  const handleStudentChange = (value: string) => {
    setSelectedStudentId(value);
    setSelectedGrades({});
    setFeedback({});
  };

  const handleGradeChange = (subjectId: number, grade: number) => {
    setSelectedGrades(prev => ({
      ...prev,
      [subjectId]: grade
    }));
  };

  const handleFeedbackChange = (subjectId: number, value: string) => {
    setFeedback(prev => ({
      ...prev,
      [subjectId]: value
    }));
  };

  const handleTestChange = (testId: number, checked: boolean) => {
    setCompletedTests(prev => ({
      ...prev,
      [testId]: checked
    }));
  };

  const handleSaveGrades = async () => {
    if (!selectedStudentId) {
      toast.error('Please select a student');
      return;
    }

    const studentId = parseInt(selectedStudentId);
    setLoading(true);
    
    try {
      // Save grades and feedback
      Object.entries(selectedGrades).forEach(([subjectId, grade]) => {
        const subjectFeedback = feedback[parseInt(subjectId)] || '';
        addGrade(studentId, parseInt(subjectId), grade, user?.id || 0, subjectFeedback);
      });
      
      // Save test completions
      Object.entries(completedTests).forEach(([testId, completed]) => {
        updateTestCompletion(studentId, parseInt(testId), completed);
      });

      toast.success('Saved successfully', {
        description: 'Student grades and test completions have been updated.',
      });
      
      // Reset form
      setSelectedGrades({});
      setFeedback({});
    } catch (error) {
      toast.error('Failed to save', {
        description: 'There was an error saving the data. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  const verrichtingenSubjects = getSubjectsByCategory(CATEGORIES.VERRICHTINGEN);
  const roeitechniekSubjects = getSubjectsByCategory(CATEGORIES.ROEITECHNIEK);
  const stuurkunstSubjects = getSubjectsByCategory(CATEGORIES.STUURKUNST);

  return (
    <DashboardLayout allowedRoles={['teacher', 'admin']}>
      <div className="container py-6">
        <h1 className="text-2xl font-semibold mb-6">Student Grading</h1>
        
        <div className="mb-6">
          <Label htmlFor="student-select" className="block mb-2">
            Select Student
          </Label>
          <Select value={selectedStudentId} onValueChange={handleStudentChange}>
            <SelectTrigger id="student-select" className="w-full md:w-80">
              <SelectValue placeholder="Select a student" />
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
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Subject Grading</CardTitle>
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
                                      
                                      {!subject.active && (
                                        <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">
                                          Inactive
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                  
                                  <div className="flex-shrink-0">
                                    <RadioGroup
                                      value={selectedGrades[subject.id]?.toString() || ""}
                                      onValueChange={(value) => handleGradeChange(subject.id, parseInt(value))}
                                      className="flex items-center space-x-2"
                                      disabled={!subject.active}
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
                                
                                <Textarea
                                  placeholder="Add feedback for the student..."
                                  value={feedback[subject.id] || ''}
                                  onChange={(e) => handleFeedbackChange(subject.id, e.target.value)}
                                  disabled={!subject.active}
                                  className="resize-none h-20"
                                />
                                
                                {!subject.active && (
                                  <p className="text-sm text-muted-foreground mt-2 italic">
                                    This subject is currently disabled by an administrator
                                  </p>
                                )}
                              </div>
                            ))}
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
                                      
                                      {!subject.active && (
                                        <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">
                                          Inactive
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                  
                                  <div className="flex-shrink-0">
                                    <RadioGroup
                                      value={selectedGrades[subject.id]?.toString() || ""}
                                      onValueChange={(value) => handleGradeChange(subject.id, parseInt(value))}
                                      className="flex items-center space-x-2"
                                      disabled={!subject.active}
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
                                
                                <Textarea
                                  placeholder="Add feedback for the student..."
                                  value={feedback[subject.id] || ''}
                                  onChange={(e) => handleFeedbackChange(subject.id, e.target.value)}
                                  disabled={!subject.active}
                                  className="resize-none h-20"
                                />
                                
                                {!subject.active && (
                                  <p className="text-sm text-muted-foreground mt-2 italic">
                                    This subject is currently disabled by an administrator
                                  </p>
                                )}
                              </div>
                            ))}
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
                                      
                                      {!subject.active && (
                                        <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">
                                          Inactive
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                  
                                  <div className="flex-shrink-0">
                                    <RadioGroup
                                      value={selectedGrades[subject.id]?.toString() || ""}
                                      onValueChange={(value) => handleGradeChange(subject.id, parseInt(value))}
                                      className="flex items-center space-x-2"
                                      disabled={!subject.active}
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
                                
                                <Textarea
                                  placeholder="Add feedback for the student..."
                                  value={feedback[subject.id] || ''}
                                  onChange={(e) => handleFeedbackChange(subject.id, e.target.value)}
                                  disabled={!subject.active}
                                  className="resize-none h-20"
                                />
                                
                                {!subject.active && (
                                  <p className="text-sm text-muted-foreground mt-2 italic">
                                    This subject is currently disabled by an administrator
                                  </p>
                                )}
                              </div>
                            ))}
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
                    <CardTitle>Test Completion</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {tests.map((test) => (
                        <div key={test.id} className="flex items-start space-x-2">
                          <Checkbox
                            id={`test-${test.id}`}
                            checked={completedTests[test.id] || false}
                            onCheckedChange={(checked) => 
                              handleTestChange(test.id, checked === true)
                            }
                          />
                          <div className="grid gap-1.5 leading-none">
                            <Label
                              htmlFor={`test-${test.id}`}
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              {test.name}
                            </Label>
                            <p className="text-sm text-muted-foreground">
                              {test.description}
                            </p>
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
                    Saving...
                  </>
                ) : 'Save Student Progress'}
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default TeacherDashboard;
