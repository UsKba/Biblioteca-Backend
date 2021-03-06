import { config } from 'dotenv';

interface NodeEnv {
  [key: string]: string;
}

const nodeModeEnv: NodeEnv = {
  TEST: '.env.test',
  PRODUCTION: '.env.production',
  DEVELOPMENT: '.env',
};

const targetMode = process.env.NODE_ENV || 'DEVELOPMENT';

config({
  path: nodeModeEnv[targetMode],
});
