import express from 'express';
import { spawn } from 'child_process';
import path from 'path';
import multer from 'multer';
import { unlink } from 'fs/promises';

const app = express();
const port = 5000;
const upload = multer({ dest: 'uploads/' });

app.use(express.json({ limit: '50mb' }));

app.post('/api/transcribe', upload.single('audio'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('No audio file uploaded.');
  }
  const audioFilePath = path.resolve(__dirname, '../../' + req.file.path);
  const pythonScript = path.resolve(__dirname, '../../ml/transcribe.py');
  const pythonProcess = spawn('python3', [pythonScript, audioFilePath]);

  let result = '';
  pythonProcess.stdout.on('data', (data) => {
    result += data.toString();
  });
  pythonProcess.stderr.on('data', (data) => {
    console.error(`Python stderr: ${data}`);
  });
  pythonProcess.on('close', async (code) => {
    await unlink(audioFilePath);
    if (code !== 0) {
      return res.status(500).send('Error during transcription.');
    }
    res.json({ text: result.trim() });
  });
});

app.post('/api/respond', (req, res) => {
  const { text } = req.body;
  const pythonScript = path.resolve(__dirname, '../../ml/respond_llm.py');
  const pythonProcess = spawn('python3', [pythonScript, text]);

  let result = '';
  pythonProcess.stdout.on('data', (data) => {
    result += data.toString();
  });
  pythonProcess.on('close', (code) => {
    if (code !== 0) {
      return res.status(500).send('LLM response error.');
    }
    res.json({ text: result.trim() });
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
