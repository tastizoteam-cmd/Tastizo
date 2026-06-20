import fs from 'fs';
import readline from 'readline';

async function run() {
  const fileStream = fs.createReadStream('C:/Users/Shailendra Rajpoot/.gemini/antigravity-ide/brain/215e732a-ccd3-4bb8-a804-2a0673cb232f/.system_generated/logs/transcript.jsonl');
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  let userMsgCount = 0;
  for await (const line of rl) {
    try {
      const obj = JSON.parse(line);
      // Log all user inputs
      if (obj.type === 'USER_INPUT') {
        userMsgCount++;
        console.log(`[USER MESSAGE ${userMsgCount}]: ${obj.content}`);
      }
      
      // Log any error outputs from tools
      if (obj.status === 'ERROR') {
        console.log(`[ERROR IN STEP ${obj.step_index}] Type: ${obj.type}, Content: ${obj.content ? obj.content.slice(0, 300) : ''}`);
      }
      
    } catch (e) {
      // Ignore parse errors
    }
  }
}

run();
