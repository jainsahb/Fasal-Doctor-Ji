
import { env } from './server/config/env.js';

const res = await fetch(`${env.supabaseUrl}/rest/v1/`, {
  headers: {
    apikey: env.supabaseServiceRoleKey,
    Authorization: `Bearer ${env.supabaseServiceRoleKey}`
  }
});

import { insertScan } from './server/config/database.js';

const scan = {
  crop: 'rice',
  region: 'UP',
  stage: 'seedling',
  language: 'en',
  disease: 'blast',
  scientific_name: 'Pyricularia oryzae',
  confidence: 92,
  result: { source: 'node-test' }
};

const saved = await insertScan(scan);
console.log(saved);

console.log('status:', res.status);
console.log(await res.text());
