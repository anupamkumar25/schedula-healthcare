"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const typeorm_1 = require("@nestjs/typeorm");
const config_1 = require("@nestjs/config");
const patient_entity_1 = require("./entities/patient.entity");
const doctor_entity_1 = require("./entities/doctor.entity");
const auth_module_1 = require("./auth/auth.module");
const availability_entity_1 = require("./entities/availability.entity");
const appointment_entity_1 = require("./entities/appointment.entity");
const availability_module_1 = require("./availability/availability.module");
const appointments_module_1 = require("./appointment/appointments.module");
const appointment_queue_entity_1 = require("./entities/appointment-queue.entity");
const temporary_availability_entity_1 = require("./entities/temporary-availability.entity");
const schedule_1 = require("@nestjs/schedule");
const scheduling_module_1 = require("./scheduling/scheduling.module");
const chat_module_1 = require("./chat/chat.module");
const message_entities_1 = require("./entities/message-entities");
const analytics_module_1 = require("./analytics/analytics.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            schedule_1.ScheduleModule.forRoot(),
            config_1.ConfigModule.forRoot({
                isGlobal: true,
            }),
            typeorm_1.TypeOrmModule.forRootAsync({
                imports: [config_1.ConfigModule],
                useFactory: (configService) => ({
                    type: 'postgres',
                    host: configService.get('DB_HOST'),
                    port: configService.get('DB_PORT'),
                    username: configService.get('DB_USERNAME'),
                    password: configService.get('DB_PASSWORD'),
                    database: configService.get('DB_DATABASE'),
                    entities: [
                        patient_entity_1.Patient,
                        doctor_entity_1.Doctor,
                        availability_entity_1.Availability,
                        appointment_entity_1.Appointment,
                        appointment_queue_entity_1.AppointmentQueue,
                        temporary_availability_entity_1.TemporaryAvailability,
                        message_entities_1.Message,
                    ],
                    synchronize: false,
                    logging: true,
                    retryAttempts: 5,
                    retryDelay: 3000,
                }),
                inject: [config_1.ConfigService],
            }),
            auth_module_1.AuthModule,
            availability_module_1.AvailabilityModule,
            appointments_module_1.AppointmentsModule,
            scheduling_module_1.SchedulingModule,
            chat_module_1.ChatModule,
            analytics_module_1.AnalyticsModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map