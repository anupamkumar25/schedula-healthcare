export interface PredictionInput {
    doctorSpecialty: string;
    patientAge: number;
    appointmentType: string;
    timeOfDay: string;
    dayOfWeek: string;
    patientHistoryVisits: number;
}
export interface PredictionResult {
    success: boolean;
    predictedDuration: number;
    confidence?: string;
    error?: string;
}
export declare class MlPredictionService {
    predictAppointmentDuration(input: PredictionInput): Promise<PredictionResult>;
}
