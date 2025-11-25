// import { ServerClient } from "postmark";

// const postmarkClient = new ServerClient(process.env.POSTMARK_SERVER_TOKEN!);

// export function sendEmail({
//   to,
//   subject,
//   html,
//   text,
// }: {
//   to: string;
//   subject: string;
//   html: string;
//   text: string;
// }) {
//   return postmarkClient.sendEmail({
//     From: process.env.POSTMARK_FROM_EMAIL!,
//     To: to,
//     Subject: subject,
//     HtmlBody: html,
//     TextBody: text,
//   });
// }

import { transporter } from "./emailConfig";

interface EmailOptions {
  to: string;
  subject: string;
  html?: string;
  text?: string;
}

export async function sendEmail({
  to,
  subject,
  html,
  text,
}: EmailOptions): Promise<void> {
  try {
    await transporter.sendMail({
      from: `"LoopCraft" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
      text,
    });

    console.log("Email sent successfully");
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Email sending failed");
  }
}
