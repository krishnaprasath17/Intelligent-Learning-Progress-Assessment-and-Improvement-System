import fs from 'node:fs';
import path from 'node:path';

const dataFile = path.resolve(process.cwd(), 'data', 'application-data.json');

if (fs.existsSync(dataFile)) {
  fs.unlinkSync(dataFile);
  console.log('Removed development user/application data. Master skills and questions are preserved in seedData.ts.');
} else {
  console.log('No persisted development user/application data found.');
}
