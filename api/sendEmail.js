import nodemailer from "nodemailer";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { name, email, phone, type, message } = req.body;

  try {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.GMAIL,
            pass: process.env.GMAIL_APP_PASSWORD,
        },
    });

    // Email to company
    const mailOptions = {
        from: `"Grain Muse Website" <grainmuse@gmail.com>`,
        to: process.env.GRAINMUSE_EMAIL,
        subject: `New Contact Form Submission - ${type || "General"}`,
        html: `
            <h2>New Enquiry Received</h2>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Phone:</strong> ${phone || "N/A"}</p>
            <p><strong>Type:</strong> ${type || "N/A"}</p>
            <p><strong>Message:</strong></p>
            <p>${message}</p>
        `,
    };

    const res = await transporter.sendMail(mailOptions);

    if (res.response === "200") {
        await transporter.sendMail({
          from: `"Grain Muse" ${process.env.GMAIL}`,
          to: email,
          subject: "We received your message",
          html: `
            <p>Hi ${name},</p>
            <p>Thank you for contacting Grain Muse. We’ll get back to you soon.</p>
          `,
        });
        return res.status(200).json({ success: true });
    } else {
        return res.status(500).json({ success: false });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false });
  }
}