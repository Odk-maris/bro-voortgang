
import { useState } from 'react';
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
  CATEGORIES,
} from '@/utils/mockData';
import FeedbackItem from '@/components/FeedbackItem';

const TeacherHistory = () => {
  const { user } = useAuth();
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [activeTab, setActiveTab] = useState(CATEGORIES.VERRICHTINGEN);

  const students = getStudentsByRole();
  
  const handleStudentChange = (value: string) => {
    setSelectedStudentId(value);
  };

  // Get student grades and tests if a student is selected
  const studentGrades = selectedStudentId
    ? getStudentGrades(parseInt(selectedStudentId))
    : [];
  
  const studentTests = selectedStudentId
    ? getStudentTests(parseInt(selectedStudentId))
    : [];
  
  const verrichtingenSubjects = getSubjectsByCategory(CATEGORIES.VERRICHTINGEN);
  const roeitechniekSubjects = getSubjectsByCategory(CATEGORIES.ROEITECHNIEK);
  const stuurkunstSubjects = getSubjectsByCategory(CATEGORIES.STUURKUNST);
  
  // Function to get grades for a subject
  const getSubjectGrades = (subjectId: number) => {
    return studentGrades
      .filter(grade => grade.subjectId === subjectId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  // Get teacher names for feedback display
  const getTeacherName = (teacherId: number) => {
    const teacher = getUserById(teacherId);
    return teacher ? teacher.name : 'Unknown Teacher';
  };

  return (
    <DashboardLayout allowedRoles={['teacher', 'admin']}>
      <div className="container py-6">
        <h1 className="text-2xl font-semibold mb-6">Student History</h1>
        
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
                    <CardTitle>Grade History</CardTitle>
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
                          className="space-y-6"
                          asChild
                        >
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                          >
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
                                      {subjectGrades.length} grade{subjectGrades.length !== 1 ? 's' : ''}
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
                                              Grade: {grade.grade}
                                            </Badge>
                                            <span className="text-sm text-muted-foreground">
                                              {new Date(grade.date).toLocaleDateString()}
                                            </span>
                                          </div>
                                        </div>
                                        
                                        <FeedbackItem 
                                          feedback={grade.feedback} 
                                          date={grade.date} 
                                          teacherName={getTeacherName(grade.teacherId)} 
                                        />
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              );
                            })}
                          </motion.div>
                        </TabsContent>

                        <TabsContent 
                          value={CATEGORIES.ROEITECHNIEK} 
                          className="space-y-6"
                          asChild
                        >
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                          >
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
                                      {subjectGrades.length} grade{subjectGrades.length !== 1 ? 's' : ''}
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
                                              Grade: {grade.grade}
                                            </Badge>
                                            <span className="text-sm text-muted-foreground">
                                              {new Date(grade.date).toLocaleDateString()}
                                            </span>
                                          </div>
                                        </div>
                                        
                                        <FeedbackItem 
                                          feedback={grade.feedback} 
                                          date={grade.date} 
                                          teacherName={getTeacherName(grade.teacherId)} 
                                        />
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              );
                            })}
                          </motion.div>
                        </TabsContent>

                        <TabsContent 
                          value={CATEGORIES.STUURKUNST} 
                          className="space-y-6"
                          asChild
                        >
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                          >
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
                                      {subjectGrades.length} grade{subjectGrades.length !== 1 ? 's' : ''}
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
                                              Grade: {grade.grade}
                                            </Badge>
                                            <span className="text-sm text-muted-foreground">
                                              {new Date(grade.date).toLocaleDateString()}
                                            </span>
                                          </div>
                                        </div>
                                        
                                        <FeedbackItem 
                                          feedback={grade.feedback} 
                                          date={grade.date} 
                                          teacherName={getTeacherName(grade.teacherId)} 
                                        />
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              );
                            })}
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
                    <CardTitle>Test Progress</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {studentTests.map((test) => (
                        <div key={test.id} className="flex items-center justify-between border rounded-lg p-3">
                          <div>
                            <p className="font-medium">Test {test.testId}</p>
                            <p className="text-sm text-muted-foreground">
                              {test.completed ? `Completed on ${new Date(test.date || '').toLocaleDateString()}` : 'Not completed'}
                            </p>
                          </div>
                          
                          <Badge
                            variant="outline"
                            className={`
                              ${test.completed ? 'bg-green-100 text-green-800 border-green-200' : 'bg-gray-100 text-gray-500 border-gray-200'}
                            `}
                          >
                            {test.completed ? 'Completed' : 'Pending'}
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
