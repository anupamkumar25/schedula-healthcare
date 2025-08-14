"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MlPredictionService = void 0;
const common_1 = require("@nestjs/common");
const python_shell_1 = require("python-shell");
const path = require("path");
let MlPredictionService = class MlPredictionService {
    async predictAppointmentDuration(input) {
        try {
            const pythonData = {
                doctor_specialty: input.doctorSpecialty,
                patient_age: input.patientAge,
                appointment_type: input.appointmentType,
                time_of_day: input.timeOfDay,
                day_of_week: input.dayOfWeek,
                patient_history_visits: input.patientHistoryVisits,
            };
            const options = {
                mode: 'text',
                pythonPath: 'python',
                pythonOptions: ['-u'],
                scriptPath: path.join(process.cwd(), 'ml'),
                args: [JSON.stringify(pythonData)],
            };
            const results = await python_shell_1.PythonShell.run('predict_duration.py', options);
            console.log('Python Output:', results);
            const raw = JSON.parse(results[0]);
            return {
                success: raw.success,
                predictedDuration: raw.predicted_duration,
                confidence: raw.confidence,
                error: raw.error,
            };
        }
        catch (error) {
            console.error('ML Prediction Error:', error);
            return {
                success: false,
                predictedDuration: 30,
                error: 'Prediction service unavailable',
            };
        }
    }
};
exports.MlPredictionService = MlPredictionService;
exports.MlPredictionService = MlPredictionService = __decorate([
    (0, common_1.Injectable)()
], MlPredictionService);
//# sourceMappingURL=ml-prediction.service.js.map