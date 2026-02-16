import { describe, it, expect } from "vitest";
import { sendEmail, generateAlertEmailHTML } from "./_core/email";

describe("Email system", () => {
  it("should have EMAIL_USER and EMAIL_PASS configured", () => {
    expect(process.env.EMAIL_USER).toBeDefined();
    expect(process.env.EMAIL_PASS).toBeDefined();
    expect(process.env.EMAIL_USER).not.toBe("");
    expect(process.env.EMAIL_PASS).not.toBe("");
  });

  it("should generate valid HTML for alert emails", () => {
    const html = generateAlertEmailHTML({
      tipo: "critico",
      mensaje: "Test message",
      modulo: "Test Module",
      expedienteRef: "EXP-123",
      destinatarioNombre: "Test User",
    });

    expect(html).toContain("Sistema de Gestión Documental");
    expect(html).toContain("CRÍTICO");
    expect(html).toContain("Test message");
    expect(html).toContain("Test Module");
    expect(html).toContain("EXP-123");
  });

  it("should attempt to send email (validates SMTP connection)", async () => {
    // This test validates that the email service is configured
    // We send to the same EMAIL_USER to avoid spamming
    const result = await sendEmail({
      to: process.env.EMAIL_USER!,
      subject: "[TEST] Sistema de Gestión Documental - Prueba de configuración",
      html: generateAlertEmailHTML({
        tipo: "informativo",
        mensaje: "Este es un correo de prueba para validar la configuración del sistema de envío de correos. Si recibes este mensaje, la configuración es correcta.",
        modulo: "Sistema",
        expedienteRef: "TEST-001",
        destinatarioNombre: "Administrador",
      }),
    });

    // If credentials are wrong, this will return false
    expect(result).toBe(true);
  }, 30000); // 30 second timeout for email send
});
