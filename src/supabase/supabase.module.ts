import { Module } from '@nestjs/common';
import { createClient } from '@supabase/supabase-js';

export const SUPABASE_CLIENT = 'SUPABASE_CLIENT';
@Module({
  providers: [
    {
      provide: SUPABASE_CLIENT,
      useFactory: () => {
        return createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
      },
    },
  ],
  exports: [SUPABASE_CLIENT],
})
export class SupabaseModule {}
