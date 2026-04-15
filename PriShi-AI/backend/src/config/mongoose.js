import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const mongoose = require('mongoose');

export default mongoose;
