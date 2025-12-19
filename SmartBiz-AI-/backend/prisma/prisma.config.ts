import { defineConfig } from '@prisma/internals';
import * as dotenv from 'dotenv';
import { join } from 'path';

dotenv.config({ path: join(__dirname, '../.env') });

export default defineConfig({
  datasource: {
    db: {
      provider: 'postgresql',
      url: 'postgresql://smartbiz_ai_db_user:qSzRmPjoHbkQ5HKfAE86pkFrlJKJO0BF@dpg-d52ecnl6ubrc739t5hhg-a/smartbiz_ai_db',
    },
  },
});
