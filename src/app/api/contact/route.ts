import { NextRequest, NextResponse } from 'next/server';
import { createOrder } from '@/lib/ordersStore';
import { buildAdminOrderEmail, buildCustomerOrderEmail } from '@/lib/emailTemplates';
import { formatMailerError, getMailerSetupError, sendMail } from '@/lib/mailer';
import { getAbsoluteStableLogoUrl, getAdminSiteSettings } from '@/lib/siteSettingsStore';

export const runtime = 'nodejs';

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

    const order = await createOrder({
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

    const setupError = getMailerSetupError();
    if (setupError) {
      console.error('Order saved, but email transport is not configured.', {
        orderId: order.id,
        setupError,
      });

      return NextResponse.json(
        {
          message: 'Zamowienie zostalo zapisane. Powiadomienia email sa chwilowo niedostepne.',
          orderSaved: true,
          emailSent: false,
        },
        { status: 200 }
      );
    }

    const settings = await getAdminSiteSettings();
    const origin = `${req.headers.get('x-forwarded-proto') || 'https'}://${req.headers.get('host')}`;
    const logoUrl = getAbsoluteStableLogoUrl(origin);
    const attachmentLabel = attachedFile
      ? `${attachedFile.name} (${(attachedFile.size / 1024 / 1024).toFixed(2)} MB)`
      : null;

    try {
      await sendMail({
        to: settings.notificationEmail,
        subject: `Nowe zamowienie | ${settings.companyName} | ${name}`,
        html: buildAdminOrderEmail({
          settings,
          logoUrl,
          name,
          phone,
          email,
          location,
          packageType,
          startDate,
          additionalInfo,
          attachmentLabel,
        }),
        attachments,
      });

      await sendMail({
        to: email,
        subject: `Potwierdzenie zamowienia | ${settings.companyName}`,
        html: buildCustomerOrderEmail({
          settings,
          logoUrl,
          name,
        }),
      });
    } catch (mailError) {
      const emailMessage = formatMailerError(mailError);

      console.error('Order saved, but sending emails failed.', {
        orderId: order.id,
        emailMessage,
      });

      return NextResponse.json(
        {
          message: 'Zamowienie zostalo zapisane. Powiadomienia email sa chwilowo niedostepne.',
          orderSaved: true,
          emailSent: false,
          emailError: emailMessage,
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { message: 'Email sent successfully!', orderSaved: true, emailSent: true },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error processing contact request:', error);
    const message = formatMailerError(error);
    return NextResponse.json(
      { message },
      { status: 500 }
    );
  }
}
