# Guía de Despliegue en Vercel - Gestión Documental CNE

Este proyecto ha sido adaptado para funcionar permanentemente en **Vercel**.

## Pasos para el Despliegue

### 1. Base de Datos (TiDB Cloud - Gratis)
Como Vercel es serverless, necesitas una base de datos externa. Te recomiendo **TiDB Cloud** (tiene un plan gratuito excelente):
1. Ve a [TiDB Cloud](https://tidbcloud.com/).
2. Crea un cluster gratuito (Serverless Tier).
3. Obtén tu `DATABASE_URL` (formato: `mysql://user:pass@host:4000/db?ssl={"rejectUnauthorized":true}`).

### 2. Preparar el Repositorio
1. Sube este código a un repositorio privado en **GitHub**.
2. Conecta tu repositorio a **Vercel**.

### 3. Configurar Variables de Entorno en Vercel
En el panel de Vercel, añade las siguientes variables:
- `DATABASE_URL`: La URL de conexión de TiDB Cloud.
- `JWT_SECRET`: Una cadena de texto aleatoria y segura.
- `NODE_ENV`: `production`

### 4. Desplegar
Vercel detectará automáticamente la configuración y desplegará el sitio. El comando de build configurado es `pnpm build`.

## Cambios Realizados
- Se añadió `vercel.json` para manejar las rutas y funciones serverless.
- Se creó `api/trpc.ts` como punto de entrada para la API en Vercel.
- Se adaptó el frontend para usar autenticación local y evitar errores de OAuth externo.
