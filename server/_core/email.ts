import nodemailer from 'nodemailer';

interface EmailPayload {
  to: string;
  subject: string;
  html: string;
}

let transporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (transporter) return transporter;

  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;

  if (!emailUser || !emailPass) {
    console.warn('[Email] EMAIL_USER or EMAIL_PASS not configured');
    return null;
  }

  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: emailUser,
      pass: emailPass,
    },
  });

  return transporter;
}

/**
 * Envía un correo electrónico usando Gmail
 * @returns true si se envió correctamente, false si falló o no está configurado
 */
export async function sendEmail(payload: EmailPayload): Promise<boolean> {
  const transport = getTransporter();
  
  if (!transport) {
    console.warn('[Email] Transporter not configured, skipping email send');
    return false;
  }

  try {
    await transport.sendMail({
      from: process.env.EMAIL_USER,
      to: payload.to,
      subject: payload.subject,
      html: payload.html,
    });
    console.log(`[Email] Sent to ${payload.to}: ${payload.subject}`);
    return true;
  } catch (error) {
    console.error('[Email] Failed to send:', error);
    return false;
  }
}

/**
 * Genera el HTML de una alerta para enviar por correo
 */
export function generateAlertEmailHTML(alerta: {
  tipo: string;
  mensaje?: string | null;
  modulo?: string | null;
  expedienteRef?: string | null;
  destinatarioNombre?: string | null;
}): string {
  const tipoColors: Record<string, string> = {
    critico: '#ef4444',
    precaucion: '#eab308',
    informativo: '#3b82f6',
  };

  const tipoLabels: Record<string, string> = {
    critico: 'CRÍTICO',
    precaucion: 'PRECAUCIÓN',
    informativo: 'INFORMATIVO',
  };

  const color = tipoColors[alerta.tipo] || '#6b7280';
  const label = tipoLabels[alerta.tipo] || alerta.tipo.toUpperCase();

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f3f4f6;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <tr>
            <td style="background: linear-gradient(135deg, #1B3A5C 0%, #0C2340 100%); padding: 30px; border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 600;">
                🔔 Sistema de Gestión Documental
              </h1>
              <p style="margin: 8px 0 0 0; color: #D4A843; font-size: 14px;">
                Consejo Nacional Electoral
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 30px 30px 20px 30px;">
              <div style="display: inline-block; background-color: ${color}; color: #ffffff; padding: 8px 16px; border-radius: 6px; font-weight: 600; font-size: 12px; text-transform: uppercase;">
                ${label}
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding: 0 30px 30px 30px;">
              ${alerta.destinatarioNombre ? `
              <p style="margin: 0 0 20px 0; color: #374151; font-size: 16px;">
                <strong>Destinatario:</strong> ${alerta.destinatarioNombre}
              </p>
              ` : ''}
              
              ${alerta.mensaje ? `
              <div style="background-color: #f9fafb; border-left: 4px solid ${color}; padding: 16px; border-radius: 4px; margin-bottom: 20px;">
                <p style="margin: 0; color: #1f2937; font-size: 15px; line-height: 1.6;">
                  ${alerta.mensaje}
                </p>
              </div>
              ` : ''}
              
              ${alerta.modulo || alerta.expedienteRef ? `
              <table width="100%" cellpadding="8" cellspacing="0" style="border: 1px solid #e5e7eb; border-radius: 6px; margin-bottom: 20px;">
                ${alerta.modulo ? `
                <tr>
                  <td style="background-color: #f9fafb; font-weight: 600; color: #6b7280; font-size: 13px; border-bottom: 1px solid #e5e7eb; width: 120px;">
                    Módulo
                  </td>
                  <td style="color: #374151; font-size: 14px; border-bottom: 1px solid #e5e7eb;">
                    ${alerta.modulo}
                  </td>
                </tr>
                ` : ''}
                ${alerta.expedienteRef ? `
                <tr>
                  <td style="background-color: #f9fafb; font-weight: 600; color: #6b7280; font-size: 13px; width: 120px;">
                    Expediente
                  </td>
                  <td style="color: #374151; font-size: 14px;">
                    ${alerta.expedienteRef}
                  </td>
                </tr>
                ` : ''}
              </table>
              ` : ''}
              
              <p style="margin: 20px 0 0 0; color: #6b7280; font-size: 13px;">
                Este es un mensaje automático del Sistema de Gestión Documental.
              </p>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f9fafb; padding: 20px 30px; border-radius: 0 0 8px 8px; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; color: #9ca3af; font-size: 12px; text-align: center;">
                © ${new Date().getFullYear()} CNE - Despacho del Magistrado Benjamín Ortiz Torres
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}
