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
      .maybeSingle();
      
    if (error) throw error;
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
      .maybeSingle();
      
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
      .maybeSingle();
      
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

// Add a new grade - Updated to work with RLS
export const addGrade = async (studentId: string | number, subjectId: number, grade: number, teacherId: string | number, feedback: string = '') => {
  try {
    const stringStudentId = convertIdToString(studentId);
    const stringTeacherId = convertIdToString(teacherId);
    
    console.log('Adding grade with parameters:', { 
      student_id: stringStudentId, 
      subject_id: subjectId, 
      grade, 
      teacher_id: stringTeacherId, 
      feedback: feedback || null 
    });
    
    const { data, error } = await supabase
      .from('grades')
      .insert({
        student_id: stringStudentId,
        subject_id: subjectId,
        grade: grade,
        teacher_id: stringTeacherId,
        feedback: feedback || null,
        date: new Date().toISOString().split('T')[0]
      })
      .select();
    
    if (error) {
      console.error('Supabase error adding grade:', error);
      throw error;
    }
    
    console.log('Grade added successfully:', data);
    return true;
  } catch (error) {
    console.error('Error adding grade:', error);
    toast.error('Failed to save grade: ' + (error as Error).message);
    return false;
  }
};

// Add test completion - Updated to work with RLS
export const addTestCompletion = async (studentId: string | number, testId: number, completed: boolean = true) => {
  try {
    const stringStudentId = convertIdToString(studentId);
    console.log('Adding test completion with parameters:', { 
      student_id: stringStudentId, 
      test_id: testId, 
      completed 
    });
    
    // First check if there's already a completion
    const { data: existingData, error: fetchError } = await supabase
      .from('test_completions')
      .select('id')
      .eq('student_id', stringStudentId)
      .eq('test_id', testId)
      .maybeSingle();
      
    if (fetchError) {
      console.error('Error checking existing test completion:', fetchError);
      throw fetchError;
    }
    
    const currentDate = new Date().toISOString().split('T')[0];
    
    if (existingData) {
      console.log('Test completion already exists with id:', existingData.id);
      // Update existing record
      const { error } = await supabase
        .from('test_completions')
        .update({ 
          completed: completed,
          date: currentDate
        })
        .eq('id', existingData.id);
      
      if (error) {
        console.error('Error updating test completion:', error);
        throw error;
      }
    } else {
      // Insert new completion
      const { error } = await supabase
        .from('test_completions')
        .insert({
          student_id: stringStudentId,
          test_id: testId,
          completed: completed,
          date: currentDate
        });
      
      if (error) {
        console.error('Error inserting test completion:', error);
        throw error;
      }
    }
    
    console.log('Test completion saved successfully');
    return true;
  } catch (error) {
    console.error('Error saving test completion:', error);
    toast.error('Failed to save test completion: ' + (error as Error).message);
    return false;
  }
};

// Add category feedback - Updated to work with RLS
export const addCategoryFeedback = async (studentId: string | number, category: CategoryEnum, feedback: string, teacherId: string | number) => {
  if (!feedback.trim()) {
    console.log('Skipping empty feedback submission');
    return true; // Skip empty feedback
  }
  
  try {
    const stringStudentId = convertIdToString(studentId);
    const stringTeacherId = convertIdToString(teacherId);
    
    console.log('Adding category feedback with parameters:', { 
      student_id: stringStudentId, 
      category, 
      feedback, 
      teacher_id: stringTeacherId 
    });
    
    const { data, error } = await supabase
      .from('category_feedback')
      .insert({
        student_id: stringStudentId,
        category: category,
        feedback: feedback,
        teacher_id: stringTeacherId,
        date: new Date().toISOString().split('T')[0]
      })
      .select();
      
    if (error) {
      console.error('Error adding category feedback:', error);
      throw error;
    }
    
    console.log('Category feedback added successfully:', data);
    return true;
  } catch (error) {
    console.error('Error adding category feedback:', error);
    toast.error('Failed to save feedback: ' + (error as Error).message);
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
export const getStudentCategoryFeedback = async (studentId: string | number, category: CategoryEnum) => {
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

// Update subject active status - Fixed to work with RLS
export const updateSubjectActiveStatus = async (subjectId: number, active: boolean) => {
  try {
    console.log(`Updating subject ${subjectId} active status to ${active}`);
    
    const { data, error } = await supabase
      .from('subjects')
      .update({ active: active })
      .eq('id', subjectId)
      .select();
      
    if (error) {
      console.error('Error updating subject status:', error);
      toast.error('Failed to update subject status', {
        description: error.message
      });
      return false;
    }
    
    console.log(`Subject ${subjectId} active status updated successfully:`, data);
    toast.success('Subject status updated', {
      description: `Subject has been ${active ? 'enabled' : 'disabled'} for grading.`
    });
    return true;
  } catch (error) {
    console.error('Unexpected error updating subject status:', error);
    toast.error('An unexpected error occurred while updating subject status');
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

// Get all test completions for a student at once (more efficient)
export const getStudentTestCompletionCounts = async (studentId: string | number) => {
  try {
    const { data, error } = await supabase
      .from('test_completions')
      .select('test_id, id')
      .eq('student_id', convertIdToString(studentId))
      .eq('completed', true);
      
    if (error) throw error;
    
    // Group and count by test_id
    const counts: Record<number, number> = {};
    if (data) {
      data.forEach((completion) => {
        const testId = completion.test_id;
        counts[testId] = (counts[testId] || 0) + 1;
      });
    }
    
    return counts;
  } catch (error) {
    console.error('Error fetching test completion counts:', error);
    return {};
  }
};

// Export constants from the existing mockData for compatibility
export const CATEGORIES = {
  VERRICHTINGEN: 'verrichtingen' as CategoryEnum,
  ROEITECHNIEK: 'roeitechniek' as CategoryEnum,
  STUURKUNST: 'stuurkunst' as CategoryEnum,
};
