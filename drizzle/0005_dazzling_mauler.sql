CREATE TABLE `dashboard_data` (
	`id` int AUTO_INCREMENT NOT NULL,
	`numero` int,
	`radicadoCne` varchar(100),
	`proceso` varchar(100),
	`tema` text,
	`fechaRadicado` varchar(30),
	`lugar` text,
	`solicitante` text,
	`referencia` text,
	`abogado` text,
	`fechaRecibido` varchar(30),
	`diasDespacho` int,
	`color` varchar(20),
	`etapa` varchar(100),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `dashboard_data_id` PRIMARY KEY(`id`)
);
