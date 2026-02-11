# Configuración de Variables de Entorno en Vercel

Para que la aplicación funcione correctamente en Vercel y se solucione el error `TypeError: Invalid URL`, debes configurar las siguientes variables de entorno en tu panel de Vercel (**Settings > Environment Variables**):

### Variables para el Frontend (Vite)
Estas variables deben empezar con `VITE_` para que sean accesibles desde el navegador:

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `VITE_OAUTH_PORTAL_URL` | URL del portal de autenticación (Manus) | `https://auth.manus.im` |
| `VITE_APP_ID` | ID de tu aplicación en el portal | `tu-app-id-aqui` |

### Variables para el Backend (Node.js/Vercel Functions)
Estas variables son necesarias para la conexión a la base de datos y la validación de sesiones:

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `DATABASE_URL` | URL de conexión a tu base de datos MySQL | `mysql://user:pass@host:port/dbname` |
| `JWT_SECRET` | Clave secreta para firmar las sesiones | `una-clave-secreta-muy-larga` |
| `OAUTH_SERVER_URL` | URL interna del servidor de OAuth | `https://api.manus.im` |
| `OWNER_OPEN_ID` | Tu OpenID para asignarte permisos de administrador | `tu-openid-aqui` |

## ¿Por qué ocurrió el error?
El error `TypeError: Invalid URL` ocurría porque la aplicación intentaba construir la URL de inicio de sesión usando una variable (`VITE_OAUTH_PORTAL_URL`) que estaba vacía o no definida en Vercel.

He aplicado una corrección en el código (`client/src/const.ts`) para que la aplicación no se bloquee si falta esta variable, pero **es indispensable que la configures en Vercel** para que el inicio de sesión funcione.
