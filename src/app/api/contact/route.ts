import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { createOrder } from '@/lib/ordersStore';

export const runtime = 'nodejs';

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT || '465', 10),
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

function toBool(value: string | null) {
  return value === 'true';
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const name = (formData.get('name') as string | null)?.trim() || '';
    const phone = (formData.get('phone') as string | null)?.trim() || '';
    const email = (formData.get('email') as string | null)?.trim().toLowerCase() || '';
    const location = (formData.get('location') as string | null)?.trim() || '';
    const packageType = (formData.get('packageType') as string | null)?.trim() || '';
    const startDate = (formData.get('startDate') as string | null)?.trim() || '';
    const additionalInfo = (formData.get('additionalInfo') as string | null)?.trim() || '';
    const attachedFile = formData.get('attachedFile') as File | null;
    const consentGDPR = toBool(formData.get('consentGDPR') as string | null);
    const consentContact = toBool(formData.get('consentContact') as string | null);

    if (!name || !email || !phone) {
      return NextResponse.json(
        { message: 'Name, email, and phone are required.' },
        { status: 400 }
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json({ message: 'Invalid email format.' }, { status: 400 });
    }

    if (!consentGDPR || !consentContact) {
      return NextResponse.json({ message: 'Required consents are missing.' }, { status: 400 });
    }

    const attachments = [];
    if (attachedFile) {
      const fileBuffer = Buffer.from(await attachedFile.arrayBuffer());
      attachments.push({
        filename: attachedFile.name,
        content: fileBuffer,
        contentType: attachedFile.type,
      });
    }

    await createOrder({
      name,
      phone,
      email,
      location,
      packageType,
      startDate,
      additionalInfo,
      consentGDPR,
      consentContact,
      attachment: attachedFile
        ? {
            originalName: attachedFile.name,
            size: attachedFile.size,
            mimeType: attachedFile.type || 'application/octet-stream',
          }
        : null,
    });

    const ownerEmailHtml = `
      <div style="font-family: 'Onest', sans-serif; color: #101010; background-color: #f0f0f0; padding: 20px;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 15px rgba(19,19,19,0.1);">
          <tr>
            <td style="background-color: #3a3a3a; padding: 30px 20px; text-align: center;">
              <h1 style="color: #ffffff; font-size: 28px; font-weight: 700; margin: 0;">N&B Interiors</h1>
              <h2 style="color: #ffffff; font-size: 22px; margin-top: 20px; margin-bottom: 0;">Nowe zgloszenie z formularza kontaktowego</h2>
            </td>
          </tr>
          <tr>
            <td style="padding: 30px;">
              <p style="font-size: 16px; line-height: 1.6; margin-bottom: 25px; font-weight: 600; color: #202020;">Otrzymales nowa wiadomosc z formularza kontaktowego:</p>
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="font-size: 15px; border-collapse: collapse;">
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #eeeeee; width: 35%; font-weight: bold; color: #555555;">Imie i Nazwisko:</td>
                  <td style="padding: 12px 0; border-bottom: 1px solid #eeeeee; color: #333333;">${name}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #eeeeee; font-weight: bold; color: #555555;">Telefon:</td>
                  <td style="padding: 12px 0; border-bottom: 1px solid #eeeeee; color: #333333;">${phone}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #eeeeee; font-weight: bold; color: #555555;">Email:</td>
                  <td style="padding: 12px 0; border-bottom: 1px solid #eeeeee; color: #333333;">${email}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #eeeeee; font-weight: bold; color: #555555;">Lokalizacja:</td>
                  <td style="padding: 12px 0; border-bottom: 1px solid #eeeeee; color: #333333;">${location || 'N/A'}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #eeeeee; font-weight: bold; color: #555555;">Rodzaj remontu:</td>
                  <td style="padding: 12px 0; border-bottom: 1px solid #eeeeee; color: #333333;">${packageType || 'N/A'}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #eeeeee; font-weight: bold; color: #555555;">Preferowana data rozpoczecia:</td>
                  <td style="padding: 12px 0; border-bottom: 1px solid #eeeeee; color: #333333;">${startDate || 'N/A'}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; font-weight: bold; vertical-align: top; color: #555555;">Dodatkowe informacje:</td>
                  <td style="padding: 12px 0; color: #333333;">${additionalInfo || 'N/A'}</td>
                </tr>
                ${
                  attachedFile
                    ? `
                <tr>
                  <td style="padding: 12px 0; font-weight: bold; color: #555555;">Zalaczony plik:</td>
                  <td style="padding: 12px 0; color: #333333;">${attachedFile.name} (${(attachedFile.size / 1024 / 1024).toFixed(2)} MB)</td>
                </tr>
                `
                    : ''
                }
              </table>
            </td>
          </tr>
          <tr>
            <td style="background-color: #d8d8d8; padding: 20px; text-align: center; font-size: 13px; color: #5a5a5a;">
              <p style="margin: 0;">&copy; ${new Date().getFullYear()} N&B Interiors. Wszelkie prawa zastrzezone.</p>
            </td>
          </tr>
        </table>
      </div>
    `;

    const customerEmailHtml = `
      <div style="font-family: 'Onest', sans-serif; color: #101010; background-color: #f0f0f0; padding: 20px;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 15px rgba(19,19,19,0.1);">
          <tr>
            <td style="background-color: #3a3a3a; padding: 30px 20px; text-align: center;">
              <h1 style="color: #ffffff; font-size: 28px; font-weight: 700; margin: 0;">N&B Interiors</h1>
              <h2 style="color: #ffffff; font-size: 22px; margin-top: 20px; margin-bottom: 0;">Dziekujemy za kontakt, ${name}!</h2>
            </td>
          </tr>
          <tr>
            <td style="padding: 30px;">
              <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px; font-weight: 600; color: #202020;">
                Witaj, ${name}!
              </p>
              <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px; color: #333333;">
                Otrzymalismy Twoja wiadomosc i bardzo doceniamy Twoje zainteresowanie naszymi uslugami.
                Skontaktujemy sie z Toba wkrotce, aby omowic szczegoly Twojego projektu.
              </p>
              <p style="font-size: 16px; line-height: 1.6; margin-bottom: 25px; color: #333333;">
                Jesli masz dodatkowe pytania, nie wahaj sie skontaktowac z nami, odpowiadajac na ten e-mail.
              </p>
              <p style="font-size: 16px; line-height: 1.6; color: #333333;">
                Z powazaniem,<br>
                Zespol N&B Interiors
              </p>
            </td>
          </tr>
          <tr>
            <td style="background-color: #d8d8d8; padding: 20px; text-align: center; font-size: 13px; color: #5a5a5a;">
              <p style="margin: 0;">&copy; ${new Date().getFullYear()} N&B Interiors. Wszelkie prawa zastrzezone.</p>
            </td>
          </tr>
        </table>
      </div>
    `;

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_RECEIVER || process.env.EMAIL_USER,
      subject: `Szczegoly nowego klienta ${name}`,
      html: ownerEmailHtml,
      attachments,
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Potwierdzenie zamowienia | N&B Interiors',
      html: customerEmailHtml,
    });

    return NextResponse.json({ message: 'Email sent successfully!' }, { status: 200 });
  } catch (error) {
    console.error('Error processing contact request:', error);
    const message = error instanceof Error ? error.message : 'Failed to process request.';
    return NextResponse.json(
      { message },
      { status: 500 }
    );
  }
}
