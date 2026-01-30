const { spawn } = require('child_process');

const CDP_PORT = 9222;
const isMac = process.platform === 'darwin';

if (isMac) {
  // -n = new instance (so we get the debug port instead of "Opening in existing session")
  const chrome = spawn('open', [
    '-n',
    '-a',
    'Google Chrome',
    '--args',
    '--remote-debugging-port=' + CDP_PORT,
  ], {
    detached: true,
    stdio: 'ignore',
  });
  chrome.unref();
  console.log('Launching Chrome with remote debugging on port', CDP_PORT);
}

process.env.CDP_ENDPOINT = `http://127.0.0.1:${CDP_PORT}`;
process.env.PORT = process.env.PORT || '8080';

// Give Chrome time to open the debug port (longer if cold start)
setTimeout(() => {
  require('./server.js');
}, 5000);
