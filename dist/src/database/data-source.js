"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppDataSource = void 0;
const typeorm_1 = require("typeorm");
const config_1 = require("@nestjs/config");
const dotenv_1 = require("dotenv");
const doctor_entity_1 = require("../entities/doctor.entity");
const patient_entity_1 = require("../entities/patient.entity");
const availability_entity_1 = require("../entities/availability.entity");
const appointment_entity_1 = require("../entities/appointment.entity");
const appointment_queue_entity_1 = require("../entities/appointment-queue.entity");
const temporary_availability_entity_1 = require("../entities/temporary-availability.entity");
const message_entities_1 = require("../entities/message-entities");
(0, dotenv_1.config)();
const configService = new config_1.ConfigService();
exports.AppDataSource = new typeorm_1.DataSource({
    type: 'postgres',
    host: configService.get('DB_HOST'),
    port: +configService.get('DB_PORT'),
    username: configService.get('DB_USERNAME'),
    password: configService.get('DB_PASSWORD'),
    database: configService.get('DB_DATABASE'),
    synchronize: false,
    logging: true,
    entities: [
        patient_entity_1.Patient,
        doctor_entity_1.Doctor,
        availability_entity_1.Availability,
        appointment_entity_1.Appointment,
        appointment_queue_entity_1.AppointmentQueue,
        temporary_availability_entity_1.TemporaryAvailability,
        message_entities_1.Message,
    ],
    migrations: ['src/migrations/*.ts'],
    migrationsTableName: 'migrations',
});
//# sourceMappingURL=data-source.js.map