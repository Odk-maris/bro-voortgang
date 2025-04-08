import { supabase, User, GroupEnum, CategoryEnum, RoleEnum } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/**
 * Utility functions that adapt the existing mock data functions to work with Supabase
 */

// Convert string ID to number safely (temporary solution until all code is updated)
export function convertId(id: string | number): number {
  if (typeof id === 'number') return id;
  return parseInt(id);
}

// Convert number ID to string safely (temporary solution until all code is updated)
export function convertIdToString(id: number | string): string {
  if (typeof id === 'string') return id;
  return id.toString();
}

// Get student data with basic error handling
export const getStudentGrades = async (studentId: string | number) => {
  try {
    const { data, error } = await supabase
      .from('grades')
      .select('*')
      .eq('student_id', convertIdToString(studentId));
      
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching student grades:', error);
    toast.error('Failed to load student grades');
    return [];
  }
};

export const getStudentTests = async (studentId: string | number) => {
  try {
    const { data, error } = await supabase
      .from('test_completions')
      .select('*')
      .eq('student_id', convertIdToString(studentId));
      
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching student tests:', error);
    toast.error('Failed to load student tests');
    return [];
  }
};

export const getStudentTestCompletionCount = async (studentId: string | number, testId: string | number) => {
  try {
    const { data, error, count } = await supabase
      .from('test_completions')
      .select('*', { count: 'exact' })
      .eq('student_id', convertIdToString(studentId))
      .eq('test_id', convertId(testId))
      .eq('completed', true);
      
    if (error) throw error;
    return count || 0;
  } catch (error) {
    console.error('Error fetching test completion count:', error);
    return 0;
  }
};

export const getStudentLatestCategoryFeedback = async (studentId: string | number, category: CategoryEnum) => {
  try {
    const { data, error } = await supabase
      .from('category_feedback')
      .select('*')
      .eq('student_id', convertIdToString(studentId))
      .eq('category', category)
      .order('date', { ascending: false })
      .limit(1)
      .single();
      
    if (error && error.code !== 'PGRST116') { // Not found error
      throw error;
    }
    
    return data || null;
  } catch (error) {
    console.error(`Error fetching ${category} feedback:`, error);
    return null;
  }
};

// Calculate student average grade for a specific subject
export const getStudentAverageGrade = async (studentId: string | number, subjectId: number) => {
  try {
    const { data, error } = await supabase
      .from('grades')
      .select('grade')
      .eq('student_id', convertIdToString(studentId))
      .eq('subject_id', subjectId);
      
    if (error) throw error;
    
    if (!data || data.length === 0) return 0;
    
    const sum = data.reduce((acc, curr) => acc + curr.grade, 0);
    return sum / data.length;
  } catch (error) {
    console.error('Error calculating average grade:', error);
    return 0;
  }
};

// Get subject by ID
export const getSubjectById = async (subjectId: number) => {
  try {
    const { data, error } = await supabase
      .from('subjects')
      .select('*')
      .eq('id', subjectId)
      .single();
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching subject:', error);
    return null;
  }
};

// Get subjects by category
export const getSubjectsByCategory = async (category: CategoryEnum) => {
  try {
    const { data, error } = await supabase
      .from('subjects')
      .select('*')
      .eq('category', category);
      
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error(`Error fetching ${category} subjects:`, error);
    return [];
  }
};

// Get user by ID
export const getUserById = async (userId: string | number) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', convertIdToString(userId))
      .single();
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching user:', error);
    return null;
  }
};

// Get students by role
export const getStudentsByRole = async (role: RoleEnum = 'student') => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('role', role);
      
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error(`Error fetching users with role ${role}:`, error);
    return [];
  }
};

// Add a new grade
export const addGrade = async (studentId: string | number, subjectId: number, grade: number, teacherId: string | number, feedback: string = '') => {
  try {
    const { error } = await supabase
      .from('grades')
      .insert({
        student_id: convertIdToString(studentId),
        subject_id: subjectId,
        grade: grade,
        teacher_id: convertIdToString(teacherId),
        feedback: feedback || null
      });
      
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error adding grade:', error);
    toast.error('Failed to save grade');
    return false;
  }
};

// Add test completion
export const addTestCompletion = async (studentId: string | number, testId: number, completed: boolean = true) => {
  try {
    const { error } = await supabase
      .from('test_completions')
      .insert({
        student_id: convertIdToString(studentId),
        test_id: testId,
        completed: completed
      });
      
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error adding test completion:', error);
    toast.error('Failed to save test completion');
    return false;
  }
};

// Add category feedback
export const addCategoryFeedback = async (studentId: string | number, category: CategoryEnum, feedback: string, teacherId: string | number) => {
  try {
    const { error } = await supabase
      .from('category_feedback')
      .insert({
        student_id: convertIdToString(studentId),
        category: category,
        feedback: feedback,
        teacher_id: convertIdToString(teacherId)
      });
      
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error adding category feedback:', error);
    toast.error('Failed to save feedback');
    return false;
  }
};

// Get student's latest grades
export const getStudentLatestGrades = async (studentId: string | number, subjectId: number) => {
  try {
    const { data, error } = await supabase
      .from('grades')
      .select('*')
      .eq('student_id', convertIdToString(studentId))
      .eq('subject_id', subjectId)
      .order('date', { ascending: false })
      .limit(5);
      
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching student latest grades:', error);
    return [];
  }
};

// Get student category feedback
export const getStudentCategoryFeedback = async (studentId: string | number, category: CategoryEnum | string) => {
  try {
    const { data, error } = await supabase
      .from('category_feedback')
      .select('*')
      .eq('student_id', convertIdToString(studentId))
      .eq('category', category)
      .order('date', { ascending: false });
      
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error(`Error fetching ${category} feedback:`, error);
    return [];
  }
};

// Update subject active status
export const updateSubjectActiveStatus = async (subjectId: number, active: boolean) => {
  try {
    const { error } = await supabase
      .from('subjects')
      .update({ active: active })
      .eq('id', subjectId);
      
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error updating subject status:', error);
    toast.error('Failed to update subject status');
    return false;
  }
};

// Get all tests
export const getAllTests = async () => {
  try {
    const { data, error } = await supabase
      .from('tests')
      .select('*');
      
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching tests:', error);
    return [];
  }
};

// Export constants from the existing mockData for compatibility
export const CATEGORIES = {
  VERRICHTINGEN: 'verrichtingen' as CategoryEnum,
  ROEITECHNIEK: 'roeitechniek' as CategoryEnum,
  STUURKUNST: 'stuurkunst' as CategoryEnum,
};
