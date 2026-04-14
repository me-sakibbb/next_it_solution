import { SUBSCRIPTION_LIMITS } from './subscription-limits';

export function getSubscriptionReminderTemplate({
  userName,
  planName,
  daysRemaining,
  billingUrl,
}: {
  userName: string;
  planName: string;
  daysRemaining: number;
  billingUrl: string;
}) {
  const brandColor = '#00A651'; // Nex IT Solution Green
  
  let subject = '';
  let title = '';
  let content = '';

  if (daysRemaining === 5) {
    subject = 'আপনার সাবস্ক্রিপশন শেষ হতে আর ৫ দিন বাকি আছে';
    title = 'সাবস্ক্রিপশন রিনিউ করার সময় হয়েছে';
    content = `আপনার <strong>${planName}</strong> প্ল্যানের মেয়াদ আর মাত্র ৫ দিন পরেই শেষ হয়ে যাবে। নিরবচ্ছিন্ন সেবা উপভোগ করতে এখনই প্ল্যানটি রিনিউ করুন।`;
  } else if (daysRemaining === 2) {
    subject = 'জরুরী: আপনার সাবস্ক্রিপশন ২ দিনের মধ্যে শেষ হয়ে যাবে';
    title = 'সাবস্ক্রিপশনের মেয়াদ প্রায় শেষ';
    content = `আপনার <strong>${planName}</strong> প্ল্যানের মেয়াদ আর মাত্র ২ দিন বাকি। আপনার সার্ভিস যেন বন্ধ না হয়, সেজন্য এখনই রিনিউ করার অনুরোধ করা হচ্ছে।`;
  } else if (daysRemaining === 1) {
    subject = 'শেষ সতর্কবার্তা: আপনার সাবস্ক্রিপশন আগামীকাল শেষ হচ্ছে';
    title = 'কালই আপনার সাবস্ক্রিপশন শেষ হচ্ছে';
    content = `আপনার <strong>${planName}</strong> প্ল্যানের মেয়াদ আগামীকাল শেষ হয়ে যাবে। সার্ভিস সচল রাখতে দয়া করে দ্রুত রিনিউ করুন।`;
  } else {
    subject = `আপনার সাবস্ক্রিপশন ${daysRemaining} দিনের মধ্যে শেষ হবে`;
    title = 'সাবস্ক্রিপশন রিমাইন্ডার';
    content = `আপনার <strong>${planName}</strong> প্ল্যানের মেয়াদ শেষ হতে আর ${daysRemaining} দিন বাকি।`;
  }

  return {
    subject,
    html: `
      <!DOCTYPE html>
      <html lang="bn">
      <head>
          <meta charset="UTF-8">
          <style>
              body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
              .container { max-width: 600px; margin: 20px auto; border: 1px solid #eee; border-radius: 8px; overflow: hidden; }
              .header { background-color: ${brandColor}; color: white; padding: 20px; text-align: center; }
              .content { padding: 30px; }
              .footer { background-color: #f9f9f9; padding: 20px; text-align: center; font-size: 12px; color: #777; }
              .btn { 
                  display: inline-block; 
                  padding: 12px 25px; 
                  background-color: ${brandColor}; 
                  color: white !important; 
                  text-decoration: none !important; 
                  border-radius: 5px; 
                  font-weight: bold; 
                  margin-top: 20px;
                  text-transform: uppercase;
              }
              .plan-info { background: #f0f7f2; border-left: 4px solid ${brandColor}; padding: 15px; margin: 20px 0; border-radius: 4px; }
          </style>
      </head>
      <body>
          <div class="container">
              <div class="header">
                  <h1 style="margin: 0; font-size: 24px;">Nex IT Solution</h1>
              </div>
              <div class="content">
                  <p>আসসালামু আলাইকুম ${userName || 'গ্রাহক'},</p>
                  <h2 style="color: ${brandColor};">${title}</h2>
                  <p>${content}</p>
                  
                  <div class="plan-info">
                      <strong>প্ল্যান:</strong> ${planName}<br>
                      <strong>বাকি সময়:</strong> ${daysRemaining} দিন
                  </div>

                  <p>নিচের বাটনে ক্লিক করে সরাসরি বিলিং পেজ থেকে পেমেন্ট সম্পন্ন করতে পারবেন:</p>
                  
                  <a href="${billingUrl}" class="btn">রিনিউ করুন</a>

                  <p style="margin-top: 30px;">ধন্যবাদ,<br><strong>Nex IT Solution টিম</strong></p>
              </div>
              <div class="footer">
                  © ${new Date().getFullYear()} Nex IT Solution. সকল অধিকার সংরক্ষিত।
              </div>
          </div>
      </body>
      </html>
    `
  };
}
