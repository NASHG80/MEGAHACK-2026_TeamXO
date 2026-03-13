const fs       = require('fs');
const path     = require('path');
const pdfParse = require('pdf-parse');
const Groq     = require('groq-sdk');

/* ─────────────────────────────────────────────────────────────
   extractResumeText
   Uses ONLY pdf-parse for PDFs (no Tesseract).
   Returns '' on any failure so registration always saves.
───────────────────────────────────────────────────────────── */
async function extractResumeText(filePath) {
  try {
    if (!filePath || !fs.existsSync(filePath)) {
      console.warn('[OCR] File not found:', filePath);
      return '';
    }

    const ext = path.extname(filePath).toLowerCase();

    if (ext === '.pdf') {
      try {
        const buf = fs.readFileSync(filePath);
        const result = await pdfParse(buf);
        const text = result.text || '';
        console.log('[OCR] pdf-parse extracted', text.length, 'chars');
        return text;
      } catch (err) {
        console.warn('[OCR] pdf-parse failed:', err.message);
        return '';
      }
    }

    // For non-PDF (images) we skip OCR and return empty — Groq won't score
    console.warn('[OCR] Non-PDF file, skipping OCR:', ext);
    return '';

  } catch (err) {
    console.error('[OCR] Unexpected error:', err.message);
    return '';
  }
}

/* ─────────────────────────────────────────────────────────────
   getAIScore
   Sends resume text to Groq, returns 0-100 integer or null.
───────────────────────────────────────────────────────────── */
async function getAIScore(resumeText) {
  if (!process.env.GROQ_API_KEY) {
    console.warn('[Groq] GROQ_API_KEY not set — skipping scoring.');
    return null;
  }
  if (!resumeText || resumeText.trim().length < 50) {
    console.warn('[Groq] Too little text to score (', resumeText?.length, 'chars)');
    return null;
  }

  try {
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    const prompt = `You are evaluating a student resume for hackathon shortlisting.
Score from 0-100 based on: technical skills, projects, programming knowledge, hackathon experience.
Reply with ONLY a single integer. No explanation.

Resume:
${resumeText.slice(0, 3000)}`;

    const res = await groq.chat.completions.create({
      model:       'llama-3.3-70b-versatile',
      messages:    [{ role: 'user', content: prompt }],
      temperature: 0.1,
      max_tokens:  5,
    });

    const raw   = res.choices[0].message.content.trim();
    const match = raw.match(/\d+/);
    const score = match ? Math.min(100, Math.max(0, parseInt(match[0], 10))) : null;
    console.log('[Groq] raw="' + raw + '" → score:', score);
    return score;

  } catch (err) {
    console.error('[Groq] Error:', err.message);
    return null;
  }
}

module.exports = { extractResumeText, getAIScore };
