import { exec } from 'child_process';

function runBenchmark() {
  console.log('Starting benchmark test...');

  // Simulate request load using autocannon
  exec('npx autocannon -c 50 -d 10 -p 10 http://localhost:3000/api/urls', (error, stdout, stderr) => {
    if (error) {
      console.error(`Benchmark error: ${error.message}`);
      return;
    }
    if (stderr) {
      console.error(`Benchmark stderr: ${stderr}`);
      return;
    }

    console.log(`Benchmark results:\n${stdout}`);
  });
}

runBenchmark();
