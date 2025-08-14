"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SchedulingModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const availability_management_controller_1 = require("./availability-management.controller");
const segment_tree_service_1 = require("./segment-tree.service");
const temporary_availability_entity_1 = require("../entities/temporary-availability.entity");
const appointment_queue_entity_1 = require("../entities/appointment-queue.entity");
const appointment_entity_1 = require("../entities/appointment.entity");
const availability_entity_1 = require("../entities/availability.entity");
const doctor_entity_1 = require("../entities/doctor.entity");
const patient_entity_1 = require("../entities/patient.entity");
const ml_prediction_service_1 = require("../../ml/ml-predictions/ml-prediction.service");
const night_queue_processor_service_1 = require("./night-queue-processor.service");
const elastic_availability_management_service_1 = require("./elastic-availability-management.service");
const availability_module_1 = require("../availability/availability.module");
let SchedulingModule = class SchedulingModule {
};
exports.SchedulingModule = SchedulingModule;
exports.SchedulingModule = SchedulingModule = __decorate([
    (0, common_1.Module)({
        imports: [
            availability_module_1.AvailabilityModule,
            typeorm_1.TypeOrmModule.forFeature([
                temporary_availability_entity_1.TemporaryAvailability,
                appointment_queue_entity_1.AppointmentQueue,
                appointment_entity_1.Appointment,
                availability_entity_1.Availability,
                doctor_entity_1.Doctor,
                patient_entity_1.Patient,
            ]),
        ],
        providers: [
            elastic_availability_management_service_1.AvailabilityManagementService,
            segment_tree_service_1.SegmentTreeService,
            night_queue_processor_service_1.QueueProcessorService,
            ml_prediction_service_1.MlPredictionService,
        ],
        controllers: [availability_management_controller_1.AvailabilityManagementController],
        exports: [
            elastic_availability_management_service_1.AvailabilityManagementService,
            segment_tree_service_1.SegmentTreeService,
            night_queue_processor_service_1.QueueProcessorService,
        ],
    })
], SchedulingModule);
//# sourceMappingURL=scheduling.module.js.map