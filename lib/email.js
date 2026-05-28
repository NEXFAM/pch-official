export async function sendWinnerEmail(name, email) {
  if (!process.env.RESEND_API_KEY) {
    console.warn('[email] RESEND_API_KEY not set — skipping winner notification')
    return
  }
  try {
    const { Resend } = await import('resend')
    const resend = new Resend(process.env.RESEND_API_KEY)
    await resend.emails.send({
      from: 'PCH Official <notify@onetimelink.cloud>',
      to: email,
      subject: '🎉 Congratulations! You won the PCH Official Giveaway!',
      html: `
        <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:600px;margin:0 auto;border-radius:16px;overflow:hidden;border:1px solid #e2e8f0">
          <div style="background:linear-gradient(135deg,#FFD700,#FFC107);padding:40px;text-align:center">
            <p style="font-size:48px;margin:0">🎉</p>
            <h1 style="color:#0f172a;margin:12px 0 0;font-size:28px;font-weight:900">You Won!</h1>
          </div>
          <div style="padding:40px;background:#fff">
            <p style="font-size:16px;color:#0f172a;margin:0">Hi <strong>${name}</strong>,</p>
            <p style="font-size:16px;color:#334155;margin:16px 0">
              Congratulations! You've been selected as the winner of the <strong>PCH Official Giveaway</strong>.
            </p>
            <p style="font-size:16px;color:#334155;margin:0 0 32px">
              Log in to your account to claim your prize. You have <strong style="color:#0f172a">48 hours</strong> to submit your payment details — don't miss out!
            </p>
            <div style="text-align:center">
              <a href="https://onetimelink.cloud/login"
                 style="display:inline-block;background:#FFD700;color:#0f172a;padding:14px 36px;border-radius:12px;font-weight:900;text-decoration:none;font-size:16px">
                Claim My Prize →
              </a>
            </div>
            <p style="font-size:13px;color:#94a3b8;margin:32px 0 0;text-align:center">
              PCH Official — Official Prize Claim Headquarters
            </p>
          </div>
        </div>
      `,
    })
    console.log('[email] Winner notification sent to', email)
  } catch (err) {
    console.error('[email] Failed to send winner email:', err)
  }
}
