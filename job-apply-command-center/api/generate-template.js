export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!process.env.OPENAI_API_KEY) return res.status(200).json({ error: 'OPENAI_API_KEY not configured' });
  const { profile, job, type } = req.body || {};
  const prompt = `Create a concise, polished ${type} for this candidate and job. Candidate: ${JSON.stringify(profile)} Job: ${JSON.stringify(job)}. Avoid inventing experience. Return only the final text.`;
  const r = await fetch('https://api.openai.com/v1/responses', { method:'POST', headers:{'Content-Type':'application/json','Authorization':`Bearer ${process.env.OPENAI_API_KEY}`}, body:JSON.stringify({ model:'gpt-4.1-mini', input:prompt }) });
  const data = await r.json();
  const text = data.output_text || data.output?.[0]?.content?.[0]?.text || '';
  res.status(200).json({ text });
}
