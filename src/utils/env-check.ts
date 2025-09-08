// Environment variable validation utility
// This file helps ensure all required environment variables are properly set

interface EnvVarConfig {
    name: string;
    required: boolean;
    isPublic?: boolean;
    description?: string;
  }
  
  // Define all environment variables that should be checked
  const requiredVars: EnvVarConfig[] = [
    {
      name: 'NEXT_PUBLIC_SUPABASE_URL',
      required: true,
      isPublic: true,
      description: 'Supabase project URL'
    },
    {
      name: 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
      required: true,
      isPublic: true,
      description: 'Supabase public anon key'
    },
    {
      name: 'SUPABASE_SERVICE_ROLE_KEY',
      required: true,
      isPublic: false,
      description: 'Supabase service role key (server-side only)'
    },
    {
      name: 'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
      required: true,
      isPublic: true,
      description: 'Clerk publishable key for authentication'
    }
  ];
  
  /**
   * Validates that all required environment variables are set
   * @returns Object containing validation results and helper methods
   */
  export function checkEnvVars() {
    const results: {
      [key: string]: {
        isSet: boolean;
        value?: string;
        isPublic: boolean;
        description?: string;
      };
    } = {};
  
    let allValid = true;
  
    // Check each required variable
    requiredVars.forEach(({ name, required, isPublic = false, description }) => {
      const value = process.env[name];
      const isSet = !!value;
  
      if (required && !isSet) {
        allValid = false;
        console.error(`❌ Missing required environment variable: ${name}`);
      }
  
      results[name] = {
        isSet,
        value: isSet ? maskSensitiveValue(name, value!) : undefined,
        isPublic,
        description
      };
    });
  
    // Log summary
    console.log('=== Environment Variables Check ===');
    console.table(
      Object.entries(results).reduce((acc, [key, value]) => {
        acc[key] = {
          Set: value.isSet ? '✅' : '❌',
          Type: value.isPublic ? 'Public' : 'Private',
          'Value Preview': value.value || 'Not Set',
          Description: value.description || ''
        };
        return acc;
      }, {} as Record<string, any>)
    );
  
    if (allValid) {
      console.log('✅ All required environment variables are properly configured');
    } else {
      console.error('❌ Some required environment variables are missing');
    }
  
    console.log('=================================');
  
    return {
      isValid: allValid,
      results,
      /**
       * Get the value of an environment variable
       * @param name Name of the environment variable
       * @returns The value or undefined if not set
       */
      get: (name: string) => process.env[name],
      /**
       * Check if all required environment variables are set
       */
      validate: () => allValid
    };
  };
  
  /**
   * Masks sensitive values in logs (like API keys)
   */
  function maskSensitiveValue(name: string, value: string): string {
    if (name.toLowerCase().includes('key') || name.toLowerCase().includes('secret')) {
      return `${value.substring(0, 4)}...${value.substring(value.length - 4)}`;
    }
    return value;
  }
  
  // Run the check when imported in non-production environments
  if (process.env.NODE_ENV !== 'production') {
    checkEnvVars();
  }