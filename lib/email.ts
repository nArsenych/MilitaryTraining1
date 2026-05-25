import nodemailer from "nodemailer";
import SMTPTransport from "nodemailer/lib/smtp-transport";

function createTransporter() {
  const config: SMTPTransport.Options = {
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  };
  return nodemailer.createTransport(config);
}

export async function sendWarningEmail(to: string, reason: string) {
  const transporter = createTransporter();
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject: "Попередження від адміністрації MilitaryTraining",
    text: `Шановний користувач,\n\nАдміністрація платформи MilitaryTraining надсилає вам офіційне попередження.\n\nПричина: ${reason}\n\nБудь ласка, дотримуйтеся правил платформи. Повторні порушення можуть призвести до тимчасового або постійного блокування акаунту.\n\nЗ повагою,\nАдміністрація MilitaryTraining`,
  });
}

export async function sendVerificationEmail(to: string, code: string) {
  const transporter = createTransporter();

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject: "Ваш код підтвердження — MilitaryTraining",
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:24px">
        <h2 style="color:#FDAB04;margin-bottom:8px">MilitaryTraining</h2>
        <p style="color:#333;margin-bottom:24px">Дякуємо за реєстрацію! Введіть цей код для підтвердження акаунту:</p>
        <div style="font-size:36px;font-weight:bold;letter-spacing:10px;color:#000;background:#f5f5f5;border-radius:12px;padding:20px 32px;display:inline-block;margin-bottom:24px">
          ${code}
        </div>
        <p style="color:#666;font-size:14px">Код діє 15 хвилин.</p>
        <p style="color:#999;font-size:12px">Якщо ви не реєструвалися — просто ігноруйте цей лист.</p>
      </div>
    `,
  });
}

export async function sendMilitaryVerificationEmail(to: string, code: string) {
  const transporter = createTransporter();
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject: "Код верифікації військового статусу — MilitaryTraining",
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:24px">
        <h2 style="color:#FDAB04;margin-bottom:8px">MilitaryTraining</h2>
        <p style="color:#333;margin-bottom:24px">Введіть цей код для підтвердження статусу військовослужбовця:</p>
        <div style="font-size:36px;font-weight:bold;letter-spacing:10px;color:#000;background:#f5f5f5;border-radius:12px;padding:20px 32px;display:inline-block;margin-bottom:24px">
          ${code}
        </div>
        <p style="color:#666;font-size:14px">Код діє 15 хвилин.</p>
        <p style="color:#999;font-size:12px">Якщо ви не запитували верифікацію — просто ігноруйте цей лист.</p>
      </div>
    `,
  });
}

export async function sendBlockEmail(to: string, reason: string, expiry: Date | null) {
  const transporter = createTransporter();
  const blockType = expiry
    ? `до ${expiry.toLocaleDateString("uk-UA", { day: "2-digit", month: "long", year: "numeric" })}`
    : "назавжди";

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject: "Ваш акаунт заблоковано — MilitaryTraining",
    text: `Шановний користувач,\n\nВаш акаунт на платформі MilitaryTraining заблоковано ${blockType}.\n\nПричина: ${reason}\n\nЯкщо ви вважаєте це помилкою, зверніться до адміністрації.\n\nЗ повагою,\nАдміністрація MilitaryTraining`,
  });
}
