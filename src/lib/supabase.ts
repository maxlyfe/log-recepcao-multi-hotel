import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim();
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();

console.log('Supabase configuration:', {
  url: supabaseUrl,
  hasKey: !!supabaseKey,
  keyPrefix: supabaseKey?.substring(0, 10) + '...'
});

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase configuration:', {
    url: supabaseUrl,
    key: supabaseKey ? 'present' : 'missing'
  });
  throw new Error('Supabase URL and Anon Key são necessários. Verifique o arquivo .env');
}

// Validate URL format
try {
  new URL(supabaseUrl);
} catch (error) {
  console.error('Invalid Supabase URL format:', supabaseUrl);
  throw new Error('URL do Supabase inválida. Verifique o formato no arquivo .env');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  },
  global: {
    headers: {
      'apikey': supabaseKey
    }
  }
});

// Test connection
const testConnection = async () => {
  try {
    console.log('Testing Supabase connection...');
    const { data, error } = await supabase
      .from('hotels')
      .select('id')
      .limit(1);
    
    if (error) {
      console.error('Supabase connection test failed:', error);
      console.error('Error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
    } else {
      console.log('Supabase connection test successful');
    }
  } catch (err) {
    console.error('Supabase connection test error:', err);
  }
};

// Run connection test
testConnection();