import { createRequire } from 'node:module';

import { ApiError } from '../utils/ApiError.js';

const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');
const Tesseract = require('tesseract.js');

function toDataUrl(file) {
  return `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
}

async function extractPdf(file) {
  const parsed = await pdfParse(file.buffer);
  return parsed.text?.trim() || '';
}

async function extractImageText(file) {
  const result = await Tesseract.recognize(file.buffer, 'eng');
  return result?.data?.text?.trim() || '';
}

export async function processUploadedFiles(files = []) {
  if (!Array.isArray(files) || files.length === 0) {
    return [];
  }

  const attachments = [];

  for (const file of files) {
    if (!file.mimetype.startsWith('image/') && file.mimetype !== 'application/pdf') {
      throw new ApiError(400, `Unsupported file type: ${file.mimetype}`);
    }

    let textContent = '';
    let dataUrl;

    if (file.mimetype === 'application/pdf') {
      textContent = await extractPdf(file);
    }

    if (file.mimetype.startsWith('image/')) {
      textContent = await extractImageText(file);
      dataUrl = toDataUrl(file);
    }

    attachments.push({
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      textContent,
      dataUrl
    });
  }

  return attachments;
}
