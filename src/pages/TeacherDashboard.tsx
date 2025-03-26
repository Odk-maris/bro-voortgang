
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
import { Plus, Minus } from 'lucide-react';
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
  const [testCompletions, setTestCompletions] = useState<Record<number, number>>({});

  const students = getStudentsByRole();

  // Initialize test completions and feedback when student changes
  useEffect(() => {
    if (selectedStudentId) {
      const studentId = parseInt(selectedStudentId);
      const studentTests = getStudentTests(studentId);
      
      // Count completed tests
      const testCounts: Record<number, number> = {};
      tests.forEach(test => {
        testCounts[test.id] = getStudentTestCompletionCount(studentId, test.id);
      });
      
      setTestCompletions(testCounts);
      
      // Get category feedback
      const verrichtingenFeedback = getStudentCategoryFeedback(studentId, CATEGORIES.VERRICHTINGEN);
      const roeitechniekFeedback = getStudentCategoryFeedback(studentId, CATEGORIES.ROEITECHNIEK);
      const stuurkunstFeedback = getStudentCategoryFeedback(studentId, CATEGORIES.STUURKUNST);
      
      setCategoryFeedback({
        [CATEGORIES.VERRICHTINGEN]: verrichtingenFeedback.length > 0 ? verrichtingenFeedback[0].feedback : '',
        [CATEGORIES.ROEITECHNIEK]: roeitechniekFeedback.length > 0 ? roeitechniekFeedback[0].feedback : '',
        [CATEGORIES.STUURKUNST]: stuurkunstFeedback.length > 0 ? stuurkunstFeedback[0].feedback : ''
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

  const handleTestIncrement = (testId: number) => {
    setTestCompletions(prev => ({
      ...prev,
      [testId]: (prev[testId] || 0) + 1
    }));
  };

  const handleTestDecrement = (testId: number) => {
    setTestCompletions(prev => ({
      ...prev,
      [testId]: Math.max(0, (prev[testId] || 0) - 1)
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
      // Save grades
      Object.entries(selectedGrades).forEach(([subjectId, grade]) => {
        addGrade(studentId, parseInt(subjectId), grade, user?.id || 0, '');
      });
      
      // Save category feedback
      Object.entries(categoryFeedback).forEach(([category, feedback]) => {
        if (feedback.trim()) {
          addCategoryFeedback(studentId, category, feedback, user?.id || 0);
        }
      });
      
      // Save test completions
      Object.entries(testCompletions).forEach(([testId, count]) => {
        const currentCount = getStudentTestCompletionCount(studentId, parseInt(testId));
        const difference = count - currentCount;
        
        if (difference > 0) {
          // Add new completions
          for (let i = 0; i < difference; i++) {
            addTestCompletion(studentId, parseInt(testId), true);
          }
        } else if (difference < 0) {
          // Remove completions
          for (let i = 0; i < Math.abs(difference); i++) {
            addTestCompletion(studentId, parseInt(testId), false);
          }
        }
      });

      toast.success('Saved successfully', {
        description: 'Student grades, feedback, and test completions have been updated.',
      });
      
      // Reset form
      setSelectedGrades({});
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
                                
                                {!subject.active && (
                                  <p className="text-sm text-muted-foreground mt-2 italic">
                                    This subject is currently disabled by an administrator
                                  </p>
                                )}
                              </div>
                            ))}
                            
                            <div className="border rounded-lg p-4 mt-6">
                              <h3 className="font-medium mb-2">Feedback for Verrichtingen</h3>
                              <Textarea
                                placeholder="Add feedback for this category..."
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
                                
                                {!subject.active && (
                                  <p className="text-sm text-muted-foreground mt-2 italic">
                                    This subject is currently disabled by an administrator
                                  </p>
                                )}
                              </div>
                            ))}
                            
                            <div className="border rounded-lg p-4 mt-6">
                              <h3 className="font-medium mb-2">Feedback for Roeitechniek</h3>
                              <Textarea
                                placeholder="Add feedback for this category..."
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
                                
                                {!subject.active && (
                                  <p className="text-sm text-muted-foreground mt-2 italic">
                                    This subject is currently disabled by an administrator
                                  </p>
                                )}
                              </div>
                            ))}
                            
                            <div className="border rounded-lg p-4 mt-6">
                              <h3 className="font-medium mb-2">Feedback for Stuurkunst</h3>
                              <Textarea
                                placeholder="Add feedback for this category..."
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
                    <CardTitle>Test Completion</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {tests.map((test) => (
                        <div key={test.id} className="flex items-start justify-between">
                          <div className="grid gap-1.5 leading-none">
                            <Label
                              className="text-sm font-medium leading-none"
                            >
                              {test.name}
                            </Label>
                            <p className="text-sm text-muted-foreground">
                              {test.description}
                            </p>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Button 
                              variant="outline" 
                              size="icon" 
                              onClick={() => handleTestDecrement(test.id)}
                              disabled={!testCompletions[test.id]}
                              className="h-8 w-8"
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <span className="w-8 text-center font-medium">
                              {testCompletions[test.id] || 0}
                            </span>
                            <Button 
                              variant="outline" 
                              size="icon" 
                              onClick={() => handleTestIncrement(test.id)}
                              className="h-8 w-8"
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
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
