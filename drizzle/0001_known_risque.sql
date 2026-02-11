CREATE TABLE `alertas` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tipo` enum('critico','precaucion','informativo') NOT NULL DEFAULT 'informativo',
	`estadoAlerta` enum('pendiente','enviada','leida') NOT NULL DEFAULT 'pendiente',
	`destinatarioUserId` int,
	`destinatarioNombre` text,
	`destinatarioEmail` varchar(320),
	`moduloAlerta` varchar(50),
	`expedienteRef` varchar(100),
	`mensaje` text,
	`fechaEnvio` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `alertas_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `autos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`numeroAuto` varchar(20) NOT NULL,
	`fecha` varchar(30),
	`radicado` varchar(50),
	`asunto` text,
	`asesor` text,
	`asesorUserId` int,
	`enlace` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `autos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `expedientes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`modulo` enum('procesos_practicas','inf_logos','revocatorias','inf_ordinarios','salvamentos','archivados') NOT NULL,
	`abogado` text,
	`abogadoUserId` int,
	`tema` text,
	`sujeto` text,
	`elecciones` text,
	`lugar` text,
	`radicadoCne` varchar(100),
	`etapaOf` varchar(20),
	`etapaIp` varchar(20),
	`etapaFc` varchar(20),
	`etapaPr` varchar(20),
	`etapaAc` varchar(20),
	`etapaDf` varchar(20),
	`etapaRc` varchar(20),
	`fechaRecibido` varchar(30),
	`diasDespacho` int,
	`diasEtapa` int,
	`devuelto` int,
	`enEstudioAbogado` varchar(50),
	`devueltoEstudio` varchar(50),
	`dianaRamos` varchar(50),
	`drLaureano` varchar(50),
	`drUriel` varchar(50),
	`enTerminos` varchar(50),
	`enSala` varchar(50),
	`enFirmas` varchar(50),
	`notifContinuaProceso` varchar(50),
	`notifSigueArchivo` varchar(50),
	`interponeRecursoArchivo` varchar(50),
	`pausa` varchar(50),
	`observaciones` text,
	`estadoProceso` varchar(100),
	`ubicacionActual` varchar(200),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `expedientes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `oficios` (
	`id` int AUTO_INCREMENT NOT NULL,
	`noOficio` varchar(20) NOT NULL,
	`fecha` varchar(30),
	`radicado` varchar(50),
	`destinatario` text,
	`asunto` text,
	`responsable` text,
	`responsableUserId` int,
	`estadoOficio` enum('Pendiente','Enviado','Recibido','Archivado') NOT NULL DEFAULT 'Pendiente',
	`enlace` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `oficios_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `appRole` enum('magistrado','administrador','abogado') DEFAULT 'abogado' NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `isActive` boolean DEFAULT true NOT NULL;