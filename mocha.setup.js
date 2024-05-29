import { createRequire } from 'module';
const require = createRequire(import.meta.url);
require('@babel/register')({
  extensions: ['.js', '.mjs']
});