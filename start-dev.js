const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting Cardbored development servers...\n');

// Start backend server
console.log('📡 Starting backend server on port 3001...');
const backend = spawn('npm', ['run', 'dev'], {
  cwd: path.join(__dirname, 'server'),
  stdio: 'pipe',
  shell: true
});

backend.stdout.on('data', (data) => {
  console.log(`[Backend] ${data.toString().trim()}`);
});

backend.stderr.on('data', (data) => {
  console.error(`[Backend Error] ${data.toString().trim()}`);
});

// Start frontend server
setTimeout(() => {
  console.log('\n🎨 Starting frontend server on port 3000...');
  const frontend = spawn('npm', ['run', 'dev'], {
    stdio: 'pipe',
    shell: true
  });

  frontend.stdout.on('data', (data) => {
    console.log(`[Frontend] ${data.toString().trim()}`);
  });

  frontend.stderr.on('data', (data) => {
    console.error(`[Frontend Error] ${data.toString().trim()}`);
  });

  // Handle process termination
  process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down servers...');
    backend.kill();
    frontend.kill();
    process.exit(0);
  });

}, 2000);

console.log('\n✨ Both servers starting up...');
console.log('🌐 Frontend will be available at: http://localhost:3000');
console.log('🔧 Backend API will be available at: http://localhost:3001');
console.log('\nPress Ctrl+C to stop both servers\n');
