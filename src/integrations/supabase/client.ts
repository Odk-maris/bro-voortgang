
// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://jmizxgtqvwwneuwqxbki.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImptaXp4Z3Rxdnd3bmV1d3F4YmtpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQxNDU4NzYsImV4cCI6MjA1OTcyMTg3Nn0.mdqteWo3w4dp4y_JdWlU8vyiOIiH1U8oinMILflzuHg";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true, // Needed for authentication to work properly
    storage: localStorage
  },
  global: {
    headers: {
      'X-Client-Info': 'lovable'
    }
  },
  db: {
    schema: 'public'
  }
});

// Create a function to set auth header using a custom approach
export const applyAuth = async (username: string, password: string) => {
  // Store the credentials in localStorage for re-use
  localStorage.setItem('auth_credentials', JSON.stringify({ username, password }));
  
  // Return true to indicate successful credential storage
  return true;
};

// Function to get stored credentials and apply them to fetch calls if needed
export const getAuthHeaders = () => {
  const storedCredentials = localStorage.getItem('auth_credentials');
  if (storedCredentials) {
    const { username, password } = JSON.parse(storedCredentials);
    return {
      Authorization: `Basic ${btoa(`${username}:${password}`)}`
    };
  }
  return {};
};

// Type helpers for tables
export type Tables = Database['public']['Tables'];
export type GroupEnum = Database['public']['Enums']['group_enum'];
export type RoleEnum = Database['public']['Enums']['role_enum'];
export type CategoryEnum = Database['public']['Enums']['category_enum'];
export type User = Tables['users']['Row'];
export type Subject = Tables['subjects']['Row'];
export type Grade = Tables['grades']['Row'];
export type TestCompletion = Tables['test_completions']['Row'];
export type CategoryFeedback = Tables['category_feedback']['Row'];
export type Test = Tables['tests']['Row'];
