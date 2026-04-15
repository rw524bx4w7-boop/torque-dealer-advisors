module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, email, phone, dealership, message } = req.body || {};

  if (!name || !email || !message || !dealership) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Email service not configured' });
  }

  function esc(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'Torque Dealer Advisors <onboarding@resend.dev>',
      to: ['ronjefferson1776@gmail.com'],
      reply_to: email,
      subject: `New inquiry from ${name} — ${dealership}`,
      html: `
        <p><strong>Name:</strong> ${esc(name)}</p>
        <p><strong>Email:</strong> ${esc(email)}</p>
        <p><strong>Phone:</strong> ${esc(phone) || '&mdash;'}</p>
        <p><strong>Dealership:</strong> ${esc(dealership)}</p>
        <hr>
        <p>${esc(message).replace(/\n/g, '<br>')}</p>
      `,
    }),
  });

  if (response.ok) {
    return res.status(200).json({ ok: true });
  }

  const err = await response.json().catch(() => ({}));
  console.error('Resend error:', err);
  return res.status(500).json({ error: 'Failed to send' });
};
