
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

export const getStudentTestCompletionCount = async (studentId: string | number, testId: number) => {
  try {
    const { data, error, count } = await supabase
      .from('test_completions')
      .select('*', { count: 'exact' })
      .eq('student_id', convertIdToString(studentId))
      .eq('test_id', testId)
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
export const getStudentAverageGrade = (studentId: string | number, subjectId: number) => {
  // Import the mock function for now
  const mockGetStudentAverageGrade = require('./mockData').getStudentAverageGrade;
  return mockGetStudentAverageGrade(convertId(studentId), subjectId);
};

// Get subject by ID
export const getSubjectById = (subjectId: number) => {
  // Import the mock function for now
  const mockGetSubjectById = require('./mockData').getSubjectById;
  return mockGetSubjectById(subjectId);
};

// Export constants from the existing mockData for compatibility
export const CATEGORIES = {
  VERRICHTINGEN: 'verrichtingen' as CategoryEnum,
  ROEITECHNIEK: 'roeitechniek' as CategoryEnum,
  STUURKUNST: 'stuurkunst' as CategoryEnum,
};

// Temporary bridge functions while we transition from mock to Supabase
// In the future, you can update components to use Supabase queries directly

// These functions temporarily use the mock data implementation from mockData.ts
// but can be replaced with real Supabase queries in a complete migration
import { 
  getSubjectsByCategory as getMockSubjectsByCategory,
  getStudentLatestGrades as getMockStudentLatestGrades,
  getUserById as getMockUserById,
  getStudentsByRole as getMockStudentsByRole,
  addGrade as addMockGrade,
  addTestCompletion as addMockTestCompletion,
  addCategoryFeedback as addMockCategoryFeedback,
  getStudentCategoryFeedback as getMockStudentCategoryFeedback,
  tests as mockTests,
} from './mockData';

// Re-export functions that haven't been migrated yet
export const getSubjectsByCategory = getMockSubjectsByCategory;
export const getStudentLatestGrades = getMockStudentLatestGrades;
export const getUserById = getMockUserById;
export const getStudentsByRole = getMockStudentsByRole;
export const addGrade = addMockGrade;
export const addTestCompletion = addMockTestCompletion;
export const addCategoryFeedback = addMockCategoryFeedback;
export const getStudentCategoryFeedback = getMockStudentCategoryFeedback;
export const tests = mockTests;
