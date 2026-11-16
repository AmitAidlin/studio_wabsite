
import { User } from '@supabase/supabase-js';

export type AuthSession = {
  user: User | null;
  isLoading: boolean;
}
