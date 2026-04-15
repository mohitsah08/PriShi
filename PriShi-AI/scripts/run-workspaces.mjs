import { spawn } from 'node:child_process';

const mode = process.argv[2] || 'dev';
const npmCommand = 'npm';

const commandMap = {
  dev: [
    'run dev --workspace prishi-ai-backend',
    'run dev --workspace prishi-ai-frontend'
  ],
  start: [
    'run start --workspace prishi-ai-backend',
    'run preview --workspace prishi-ai-frontend'
  ]
};

if (!commandMap[mode]) {
  console.error(`Unsupported workspace mode: ${mode}`);
  process.exit(1);
}

const children = commandMap[mode].map((args, index) => {
  const label = index === 0 ? 'backend' : 'frontend';
  const child = spawn(`${npmCommand} ${args}`, {
    cwd: process.cwd(),
    stdio: 'inherit',
    shell: true
  });

  child.on('exit', (code) => {
    if (code && code !== 0) {
      console.error(`${label} exited with code ${code}`);
      if (mode !== 'dev') {
        shutdown(code);
      }
    }
  });

  child.on('error', (error) => {
    console.error(`${label} failed to start`, error);
    if (mode !== 'dev') {
      shutdown(1);
    }
  });

  return child;
});

let closed = false;

function shutdown(code = 0) {
  if (closed) {
    return;
  }

  closed = true;

  for (const child of children) {
    if (!child.killed) {
      child.kill('SIGINT');
    }
  }

  process.exit(code);
}

process.on('SIGINT', () => shutdown(0));
process.on('SIGTERM', () => shutdown(0));
