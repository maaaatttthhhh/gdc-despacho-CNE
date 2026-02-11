CREATE TABLE `semaforo_config` (
	`id` int AUTO_INCREMENT NOT NULL,
	`nombre` varchar(50) NOT NULL,
	`verdeMax` int NOT NULL DEFAULT 30,
	`amarilloMax` int NOT NULL DEFAULT 90,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `semaforo_config_id` PRIMARY KEY(`id`),
	CONSTRAINT `semaforo_config_nombre_unique` UNIQUE(`nombre`)
);
