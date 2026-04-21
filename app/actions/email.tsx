'use server';

import { db } from "@/lib/db";
import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";
import SMTPTransport from "nodemailer/lib/smtp-transport";

export async function sendConfirmationEmail(formData: FormData) {
  const purchaseId = formData.get('purchaseId') as string;
  
  try {
    const purchase = await db.purchase.findUnique({
      where: { id: purchaseId },
      include: {
        student: {
          include: {
            user: {
              select: { email: true }
            }
          }
        },
        course: true,
      }
    });

    if (!purchase) {
      throw new Error("Purchase not found");
    }

    const userEmail = purchase.student.user?.email;

    if (!userEmail) {
      throw new Error("User email not found");
    }

    const transportConfig: SMTPTransport.Options = {
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    };

    const transporter: Transporter = nodemailer.createTransport(transportConfig);

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: userEmail,
      subject: `Запис на курс "${purchase.course.title}" підтверджено`,
      text: `Вітаємо! Ваш запис на курс "${purchase.course.title}" було підтверджено. Чекаємо на вас!`
    });

    return { success: true } as const;
  } catch (error) {
    console.error('Error sending confirmation:', error);
    return { success: false, error: 'Failed to send confirmation' } as const;
  }
}
