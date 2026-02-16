# Upgrade Full-Stack - Gestión Documental

## Fase 1: Upgrade infraestructura
- [x] Ejecutar webdev_add_feature web-db-user
- [x] Verificar que el servidor y base de datos funcionan

## Fase 2: Base de datos
- [x] Crear tabla users (id, username, password, name, email, role: magistrado/admin/abogado)
- [x] Crear tabla expedientes (con todos los campos de cada módulo)
- [x] Crear tabla autos (numero_auto, fecha, radicado, asunto, asesor, enlace)
- [x] Crear tabla oficios (no_oficio, fecha, radicado, destinatario, asunto, responsable, estado, enlace)
- [x] Crear tabla alertas (tipo, prioridad, estado, destinatario, módulo, expediente, mensaje, fecha)
- [x] Seed data: migrar TODOS los datos del Excel a la base de datos (988 expedientes)
- [x] Seed users: admin + abogados (se crean al hacer login via OAuth)

## Fase 3: Backend API (tRPC)
- [x] auth.me - obtener usuario actual via OAuth
- [x] expedientes.list - listar expedientes por módulo (filtrado por rol)
- [x] expedientes.update - actualizar expediente (abogado solo los suyos)
- [x] expedientes.create - crear nuevo expediente
- [x] autos.list / autos.create / autos.update / autos.delete - CRUD autos
- [x] oficios.list / oficios.create / oficios.update / oficios.delete - CRUD oficios
- [x] alertas.list / alertas.create / alertas.send - gestión de alertas
- [x] dashboard.stats - estadísticas del dashboard con semáforo
- [x] users.list / users.updateRole - gestión de usuarios (solo admin)
- [x] Middleware de roles y permisos (protectedProcedure + adminProcedure)

## Fase 4: Alertas automáticas
- [x] Endpoint para generar alertas según días en despacho
- [x] Notificación al owner via notifyOwner
- [x] Página de Centro de Alertas con semáforo de prioridad

## Fase 5: Frontend actualizado
- [x] Login conectado al backend real (OAuth Manus)
- [x] Tablas conectadas a API en vez de datos estáticos
- [x] Abogado: solo ve sus expedientes
- [x] Abogado: puede editar estado y observaciones de sus expedientes
- [x] Magistrado/Admin: ve todo
- [x] Dashboard con datos en tiempo real desde BD
- [x] Todas las columnas visibles (En Estudio Abogado, Devuelto, Diana Ramos, etc.)

## Fase 6: Panel de administración
- [x] Página de gestión de usuarios (crear, editar roles, activar/desactivar)
- [x] Asignación de roles por usuario

## Fase 7: Tests
- [x] 23 tests vitest pasando (auth, expedientes, dashboard, autos, oficios, alertas, users, semáforo config, importación masiva)

## Corrección urgente: Datos dañados durante upgrade
- [x] Diagnosticar qué campos se perdieron o se muestran incorrectos vs Excel original
- [x] Corregir datos en la BD para que coincidan exactamente con el Excel
- [x] Verificar que el frontend muestra toda la información completa como antes

## Corrección urgente #2: Total debe ser 2059, columnas de etapas faltantes
- [x] Analizar Excel desde cero y contar TODOS los registros (2059 en DATA PARA INFORME)
- [x] Mapear TODAS las columnas de cada hoja sin omitir ninguna
- [x] Re-extraer datos completos con todas las columnas incluyendo etapas (X, P)
- [x] Recargar BD con 2082 expedientes (2059 + 14 salvamentos + 9 adicionales)
- [x] Verificar que las columnas de etapas se muestran en el frontend
- [x] NO tocar diseño ni estructura, solo datos

## Corrección urgente #3: Columnas faltantes y datos incompletos
- [x] Re-extraer Procesos y Prácticas con TODAS las columnas exactas del Excel
- [x] Re-extraer Inf. Logos con TODAS las columnas incluyendo OF/IP/FC/P/AC/DF/R
- [x] Re-extraer Revocatorias con TODAS las columnas
- [x] Re-extraer Inf. Ordinarios con TODAS las columnas
- [x] Re-extraer Salvamentos con estructura exacta (SALVAMENTOS + ACLARACIONES)
- [x] Re-extraer Archivados con TODAS las columnas incluyendo OF/IP/FC/P/AC/DF/R
- [x] Actualizar schema BD con columnas de etapas
- [x] Actualizar frontend de cada módulo para mostrar TODAS las columnas exactas
- [x] Total: 2082 registros

## Nuevas funcionalidades: Importación Excel + Configuración Semáforo
- [x] Backend: tabla de configuración del semáforo en BD
- [x] Backend: API para leer/actualizar parámetros del semáforo
- [x] Backend: API para importar archivo Excel masivamente
- [x] Frontend: página de importación masiva de Excel (solo admin)
- [x] Frontend: panel de configuración del semáforo (solo admin)
- [x] Integrar en sidebar y rutas (sin tocar nada existente)
- [x] Probar que nada existente se dañó (23 tests pasando)
- [x] NO modificar ningún módulo, tabla, dato ni diseño existente

## Correcciones urgentes: Fechas, Colores, Salvamentos, Semáforos por columna
- [x] Corregir fechas numéricas (45875) → formato dd/mm/yy en todas las tablas
- [x] Agregar colores condicionales en celdas según reglas
- [x] Arreglar importación de hoja Salvamentos y Aclaraciones en cargue Excel
- [x] Agregar configuración de semáforos por columna en la UI (editable)
- [x] Pintar colores en TODOS los módulos
- [x] 23 tests pasando

## Correcciones urgentes #4: Salvamentos y Correos
- [x] Verificar nombre exacto de hoja Salvamentos en Excel ("SALVAMENTOS Y ACLARACIONES P")
- [x] Arreglar mapeo de nombre de hoja en ImportarExcel.tsx
- [x] Implementar sistema de envío de correos con nodemailer + Gmail
- [x] Configurar credenciales EMAIL_USER y EMAIL_PASS
- [x] Test de envío de correos pasando correctamente
- [x] Sistema envía correos automáticamente cuando se crea una alerta con destinatarioEmail

## Corrección urgente #5: Salvamentos y DATA PARA INFORME
- [x] Verificar nombre exacto de hoja Salvamentos en el Excel ("SALVAMENTOS Y ACLARACIONES P")
- [x] Verificar estructura de hoja DATA PARA INFORME (2061 filas, 35 columnas)
- [ ] Arreglar importación de Salvamentos (mapeo ya existe, investigando por qué no funciona)
- [ ] Agregar importación de DATA PARA INFORME
- [ ] Usar datos de DATA PARA INFORME en el dashboard
- [x] NO cambiar nada más del sistema existente
