import { processUploadedFiles } from '../services/upload.service.js';

export async function uploadFiles(req, res) {
  const attachments = await processUploadedFiles(req.files || []);

  res.json({
    success: true,
    data: attachments.map((attachment) => ({
      originalName: attachment.originalName,
      mimeType: attachment.mimeType,
      size: attachment.size,
      extractedPreview: attachment.textContent?.slice(0, 500) || '',
      hasVisionPayload: Boolean(attachment.dataUrl)
    }))
  });
}
