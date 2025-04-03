// Mock data for the application
// In a real app, this would be fetched from a database

// Subject categories
export const CATEGORIES = {
  VERRICHTINGEN: 'verrichtingen',
  ROEITECHNIEK: 'roeitechniek',
  STUURKUNST: 'stuurkunst'
};

// Group options for students
export const GROUPS = {
  DIZA: 'diza',
  NONE: ''  // Empty string for users without a group
};

// Subject definitions
export const subjects = [
  // Verrichtingen (14)
  { id: 1, name: 'Bootbehandeling', category: CATEGORIES.VERRICHTINGEN, active: true },
  { id: 2, name: 'Riemenbehandeling', category: CATEGORIES.VERRICHTINGEN, active: true },
  { id: 3, name: 'In- en uitstappen', category: CATEGORIES.VERRICHTINGEN, active: true },
  { id: 4, name: 'Wegvaren', category: CATEGORIES.VERRICHTINGEN, active: true },
  { id: 5, name: 'Aanleggen', category: CATEGORIES.VERRICHTINGEN, active: true },
  { id: 6, name: 'Strijken', category: CATEGORIES.VERRICHTINGEN, active: true },
  { id: 7, name: 'Ronden', category: CATEGORIES.VERRICHTINGEN, active: true },
  { id: 8, name: 'Halend aanleggen', category: CATEGORIES.VERRICHTINGEN, active: true },
  { id: 9, name: 'Houden', category: CATEGORIES.VERRICHTINGEN, active: true },
  { id: 10, name: 'Manoeuvres waterzijde', category: CATEGORIES.VERRICHTINGEN, active: true },
  { id: 11, name: 'Noodstop', category: CATEGORIES.VERRICHTINGEN, active: true },
  { id: 12, name: 'Slippen', category: CATEGORIES.VERRICHTINGEN, active: true },
  { id: 13, name: 'Wisselen in de boot', category: CATEGORIES.VERRICHTINGEN, active: true },
  { id: 14, name: 'Bootvervoer', category: CATEGORIES.VERRICHTINGEN, active: true },
  
  // Roeitechniek (11)
  { id: 15, name: 'Inpik', category: CATEGORIES.ROEITECHNIEK, active: true },
  { id: 16, name: 'Doorhaal', category: CATEGORIES.ROEITECHNIEK, active: true },
  { id: 17, name: 'Uitpik', category: CATEGORIES.ROEITECHNIEK, active: true },
  { id: 18, name: 'Recover', category: CATEGORIES.ROEITECHNIEK, active: true },
  { id: 19, name: 'Balans', category: CATEGORIES.ROEITECHNIEK, active: true },
  { id: 20, name: 'Ritme', category: CATEGORIES.ROEITECHNIEK, active: true },
  { id: 21, name: 'Kracht', category: CATEGORIES.ROEITECHNIEK, active: true },
  { id: 22, name: 'Ademhaling', category: CATEGORIES.ROEITECHNIEK, active: true },
  { id: 23, name: 'Gelijk roeien', category: CATEGORIES.ROEITECHNIEK, active: true },
  { id: 24, name: 'Houding', category: CATEGORIES.ROEITECHNIEK, active: true },
  { id: 25, name: 'Techniekkennis', category: CATEGORIES.ROEITECHNIEK, active: true },
  
  // Stuurkunst (8)
  { id: 26, name: 'Koersvastheid', category: CATEGORIES.STUURKUNST, active: true },
  { id: 27, name: 'Commando\'s', category: CATEGORIES.STUURKUNST, active: true },
  { id: 28, name: 'Startprocedure', category: CATEGORIES.STUURKUNST, active: true },
  { id: 29, name: 'Brugpassage', category: CATEGORIES.STUURKUNST, active: true },
  { id: 30, name: 'Vaarregels', category: CATEGORIES.STUURKUNST, active: true },
  { id: 31, name: 'Omgaan met omstandigheden', category: CATEGORIES.STUURKUNST, active: true },
  { id: 32, name: 'Botenhuis kennis', category: CATEGORIES.STUURKUNST, active: true },
  { id: 33, name: 'Veiligheid', category: CATEGORIES.STUURKUNST, active: true },
];

// Tests
export const tests = [
  { id: 1, name: 'Theorie Basistest', description: 'Basiskennis over roeitechniek en -termen' },
  { id: 2, name: 'Praktijk Basistest', description: 'Basistechnieken in praktijk' },
  { id: 3, name: 'Theorie Scullen', description: 'Theoretische kennis over scullen' },
  { id: 4, name: 'Praktijk Scullen', description: 'Praktische vaardigheden scullen' },
  { id: 5, name: 'Theorie Boordroeien', description: 'Theoretische kennis over boordroeien' },
  { id: 6, name: 'Praktijk Boordroeien', description: 'Praktische vaardigheden boordroeien' },
  { id: 7, name: 'Theorie Sturen', description: 'Theoretische kennis over sturen' },
  { id: 8, name: 'Praktijk Sturen', description: 'Praktische vaardigheden sturen' },
  { id: 9, name: 'Theorie Gevorderd', description: 'Gevorderde theoretische kennis' },
  { id: 10, name: 'Praktijk Gevorderd', description: 'Gevorderde praktische vaardigheden' },
];

// Users
export const users = [
  { 
    id: 1, 
    username: 'student1', 
    password: 'password1', 
    name: 'Jan Jansen', 
    role: 'student',
    groep: GROUPS.DIZA
  },
  { 
    id: 2, 
    username: 'student2', 
    password: 'password2', 
    name: 'Emma de Vries', 
    role: 'student',
    groep: GROUPS.NONE
  },
  { 
    id: 3, 
    username: 'teacher1', 
    password: 'password3', 
    name: 'Prof. Bakker', 
    role: 'teacher' 
  },
  { 
    id: 4, 
    username: 'teacher2', 
    password: 'password4', 
    name: 'Dr. Visser', 
    role: 'teacher' 
  },
  { 
    id: 5, 
    username: 'admin1', 
    password: 'password5', 
    name: 'Directeur Smit', 
    role: 'admin' 
  },
];

// Category feedback
export const categoryFeedback = [
  // Student 1 category feedback
  { 
    id: 1, 
    studentId: 1, 
    category: CATEGORIES.VERRICHTINGEN, 
    feedback: 'Good progress in handling equipment. Work on consistent technique.', 
    date: '2023-06-20', 
    teacherId: 3 
  },
  { 
    id: 2, 
    studentId: 1, 
    category: CATEGORIES.ROEITECHNIEK, 
    feedback: 'Excellent rowing technique. Continue practicing recovery timing.', 
    date: '2023-05-22', 
    teacherId: 3 
  },
  { 
    id: 3, 
    studentId: 1, 
    category: CATEGORIES.STUURKUNST, 
    feedback: 'Very good steering skills. Work on commands during bridge passing.', 
    date: '2023-06-05', 
    teacherId: 4 
  },
  
  // Student 2 category feedback
  { 
    id: 4, 
    studentId: 2, 
    category: CATEGORIES.VERRICHTINGEN, 
    feedback: 'Handling is improving. Keep working on consistent approach.', 
    date: '2023-05-15', 
    teacherId: 3 
  },
  { 
    id: 5, 
    studentId: 2, 
    category: CATEGORIES.ROEITECHNIEK, 
    feedback: 'Good improvement on technique. Focus on synchronization.', 
    date: '2023-06-10', 
    teacherId: 3 
  },
  { 
    id: 6, 
    studentId: 2, 
    category: CATEGORIES.STUURKUNST, 
    feedback: 'Steering skills are acceptable. Work on emergency procedures.', 
    date: '2023-06-05', 
    teacherId: 4 
  },
];

// Student grades
export const grades = [
  // Student 1 grades
  { id: 1, studentId: 1, subjectId: 1, grade: 2, date: '2023-05-15', teacherId: 3, feedback: 'Goede voortgang, let nog op houding.' },
  { id: 2, studentId: 1, subjectId: 1, grade: 3, date: '2023-06-20', teacherId: 3, feedback: 'Uitstekende verbetering!' },
  { id: 3, studentId: 1, subjectId: 2, grade: 2, date: '2023-05-15', teacherId: 3, feedback: 'Techniek is verbeterd.' },
  { id: 4, studentId: 1, subjectId: 3, grade: 1, date: '2023-05-10', teacherId: 4, feedback: 'Meer oefening nodig.' },
  { id: 5, studentId: 1, subjectId: 3, grade: 2, date: '2023-06-15', teacherId: 4, feedback: 'Flinke verbetering gezien.' },
  { id: 6, studentId: 1, subjectId: 15, grade: 3, date: '2023-05-22', teacherId: 3, feedback: 'Perfecte techniek!' },
  { id: 7, studentId: 1, subjectId: 16, grade: 2, date: '2023-05-22', teacherId: 3, feedback: 'Goed, blijf oefenen.' },
  { id: 8, studentId: 1, subjectId: 26, grade: 3, date: '2023-06-05', teacherId: 4, feedback: 'Uitstekende stuurvaardigheden.' },
  
  // Student 2 grades
  { id: 9, studentId: 2, subjectId: 1, grade: 3, date: '2023-05-15', teacherId: 3, feedback: 'Uitstekend werk!' },
  { id: 10, studentId: 2, subjectId: 2, grade: 2, date: '2023-05-15', teacherId: 3, feedback: 'Goede techniek, blijf oefenen.' },
  { id: 11, studentId: 2, subjectId: 3, grade: 3, date: '2023-05-10', teacherId: 4, feedback: 'Perfect uitgevoerd.' },
  { id: 12, studentId: 2, subjectId: 15, grade: 1, date: '2023-05-22', teacherId: 3, feedback: 'Meer aandacht nodig voor techniek.' },
  { id: 13, studentId: 2, subjectId: 15, grade: 2, date: '2023-06-10', teacherId: 3, feedback: 'Betere techniek, blijf oefenen.' },
  { id: 14, studentId: 2, subjectId: 16, grade: 2, date: '2023-05-22', teacherId: 3, feedback: 'Goed, maar kan beter.' },
  { id: 15, studentId: 2, subjectId: 26, grade: 2, date: '2023-06-05', teacherId: 4, feedback: 'Goede stuurvaardigheden.' },
];

// Student test completions
export const testCompletions = [
  { id: 1, studentId: 1, testId: 1, completed: true, date: '2023-04-10' },
  { id: 2, studentId: 1, testId: 1, completed: true, date: '2023-05-15' },
  { id: 3, studentId: 1, testId: 2, completed: true, date: '2023-04-15' },
  { id: 4, studentId: 1, testId: 3, completed: true, date: '2023-05-10' },
  { id: 5, studentId: 1, testId: 4, completed: false, date: null },
  { id: 6, studentId: 2, testId: 1, completed: true, date: '2023-04-12' },
  { id: 7, studentId: 2, testId: 2, completed: true, date: '2023-04-18' },
  { id: 8, studentId: 2, testId: 2, completed: true, date: '2023-05-20' },
  { id: 9, studentId: 2, testId: 3, completed: false, date: null },
];

// Helper functions to work with the mock data
export const getStudentGrades = (studentId: number) => {
  return grades.filter(grade => grade.studentId === studentId);
};

export const getStudentTests = (studentId: number) => {
  return testCompletions.filter(test => test.studentId === studentId);
};

export const getStudentTestCompletionCount = (studentId: number, testId: number) => {
  return testCompletions.filter(
    test => test.studentId === studentId && test.testId === testId && test.completed
  ).length;
};

export const getSubjectById = (subjectId: number) => {
  return subjects.find(subject => subject.id === subjectId);
};

export const getTestById = (testId: number) => {
  return tests.find(test => test.id === testId);
};

export const getUserByCredentials = (username: string, password: string) => {
  return users.find(user => user.username === username && user.password === password);
};

export const getUserById = (userId: number) => {
  return users.find(user => user.id === userId);
};

export const getStudentLatestGrades = (studentId: number, subjectId: number, limit = 3) => {
  return grades
    .filter(grade => grade.studentId === studentId && grade.subjectId === subjectId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, limit);
};

export const getStudentAverageGrade = (studentId: number, subjectId: number) => {
  const studentSubjectGrades = grades
    .filter(grade => grade.studentId === studentId && grade.subjectId === subjectId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3);
  
  if (studentSubjectGrades.length === 0) return 0;
  
  const sum = studentSubjectGrades.reduce((acc, curr) => acc + curr.grade, 0);
  return sum / studentSubjectGrades.length;
};

export const getStudentsByRole = () => {
  return users.filter(user => user.role === 'student');
};

export const getTeachersByRole = () => {
  return users.filter(user => user.role === 'teacher' || user.role === 'admin');
};

export const getSubjectsByCategory = (category: string) => {
  return subjects.filter(subject => subject.category === category);
};

export const updateSubjectActiveStatus = (subjectId: number, active: boolean) => {
  const subjectIndex = subjects.findIndex(subject => subject.id === subjectId);
  if (subjectIndex !== -1) {
    subjects[subjectIndex].active = active;
  }
  return subjects[subjectIndex];
};

export const addGrade = (
  studentId: number, 
  subjectId: number, 
  grade: number,
  teacherId: number, 
  feedback: string
) => {
  const newGrade = {
    id: grades.length + 1,
    studentId,
    subjectId,
    grade,
    date: new Date().toISOString().split('T')[0],
    teacherId,
    feedback
  };
  
  grades.push(newGrade);
  return newGrade;
};

export const getStudentCategoryFeedback = (studentId: number, category: string) => {
  return categoryFeedback
    .filter(feedback => feedback.studentId === studentId && feedback.category === category)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

export const getStudentLatestCategoryFeedback = (studentId: number, category: string) => {
  const feedback = getStudentCategoryFeedback(studentId, category);
  return feedback.length > 0 ? feedback[0] : null;
};

export const addCategoryFeedback = (
  studentId: number,
  category: string,
  feedback: string,
  teacherId: number
) => {
  const newFeedback = {
    id: categoryFeedback.length + 1,
    studentId,
    category,
    feedback,
    date: new Date().toISOString().split('T')[0],
    teacherId
  };
  
  categoryFeedback.push(newFeedback);
  return newFeedback;
};

export const addTestCompletion = (
  studentId: number,
  testId: number,
  completed: boolean
) => {
  const newTestCompletion = {
    id: testCompletions.length + 1,
    studentId,
    testId,
    completed,
    date: completed ? new Date().toISOString().split('T')[0] : null
  };
  
  testCompletions.push(newTestCompletion);
  return newTestCompletion;
};

export const updateTestCompletion = (
  studentId: number,
  testId: number,
  completed: boolean
) => {
  if (completed) {
    return addTestCompletion(studentId, testId, completed);
  } else {
    const testCompletionsForStudent = testCompletions
      .filter(test => test.studentId === studentId && test.testId === testId && test.completed)
      .sort((a, b) => {
        if (!a.date || !b.date) return 0;
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      });
    
    if (testCompletionsForStudent.length > 0) {
      const index = testCompletions.findIndex(test => test.id === testCompletionsForStudent[0].id);
      if (index !== -1) {
        testCompletions.splice(index, 1);
      }
    }
    
    return null;
  }
};

// User management functions
export const addUser = (
  username: string,
  password: string,
  name: string,
  role: 'student' | 'teacher' | 'admin',
  groep: string = ''
) => {
  const newUser = {
    id: users.length > 0 ? Math.max(...users.map(user => user.id)) + 1 : 1,
    username,
    password,
    name,
    role,
    ...(role === 'student' ? { groep } : {})
  };
  
  users.push(newUser);
  return newUser;
};

export const updateUser = (
  id: number,
  username: string,
  password: string | null,
  name: string,
  role: 'student' | 'teacher' | 'admin',
  groep: string = ''
) => {
  const userIndex = users.findIndex(user => user.id === id);
  if (userIndex !== -1) {
    users[userIndex] = {
      ...users[userIndex],
      username,
      name,
      role,
      ...(password ? { password } : {}),
      ...(role === 'student' ? { groep } : {})
    };
    return users[userIndex];
  }
  return null;
};

export const deleteUser = (id: number) => {
  const userIndex = users.findIndex(user => user.id === id);
  if (userIndex !== -1) {
    const deletedUser = users.splice(userIndex, 1)[0];
    return deletedUser;
  }
  return null;
};
