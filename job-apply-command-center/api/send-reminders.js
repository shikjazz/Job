export default async function handler(req, res) {
  // Optional scheduled email reminder endpoint. Configure RESEND_API_KEY and REMINDER_TO_EMAIL in Vercel.
  if (!process.env.RESEND_API_KEY || !process.env.REMINDER_TO_EMAIL) return res.status(200).json({ ok:false, message:'Resend not configured' });
  const r = await fetch('https://api.resend.com/emails', { method:'POST', headers:{'Content-Type':'application/json','Authorization':`Bearer ${process.env.RESEND_API_KEY}`}, body:JSON.stringify({ from:'Job Tracker <onboarding@resend.dev>', to:process.env.REMINDER_TO_EMAIL, subject:'Job tracker reminder', html:'<p>Open your Job Command Center and check follow-ups due today.</p>' }) });
  const data = await r.json();
  res.status(200).json({ ok:true, data });
}
