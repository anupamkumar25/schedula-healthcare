import { Injectable } from '@nestjs/common';
import { PythonShell } from 'python-shell';
import type { Options as PythonShellOptions } from 'python-shell';
import * as path from 'path';

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

@Injectable()
export class MlPredictionService {
  async predictAppointmentDuration(
    input: PredictionInput,
  ): Promise<PredictionResult> {
    try {
      const pythonData = {
        doctor_specialty: input.doctorSpecialty,
        patient_age: input.patientAge,
        appointment_type: input.appointmentType,
        time_of_day: input.timeOfDay,
        day_of_week: input.dayOfWeek,
        patient_history_visits: input.patientHistoryVisits,
      };

      const options: PythonShellOptions = {
        mode: 'text' as const,
        pythonPath: 'python',
        pythonOptions: ['-u'],
        scriptPath: path.join(process.cwd(), 'ml'),
        args: [JSON.stringify(pythonData)],
      };

      const results = await PythonShell.run('predict_duration.py', options);
      console.log('Python Output:', results);

      const raw = JSON.parse(results[0] as string) as {
        success: boolean;
        predicted_duration: number;
        confidence?: string;
        error?: string;
      };

      return {
        success: raw.success,
        predictedDuration: raw.predicted_duration,
        confidence: raw.confidence,
        error: raw.error,
      };
    } catch (error) {
      console.error('ML Prediction Error:', error);
      return {
        success: false,
        predictedDuration: 30,
        error: 'Prediction service unavailable',
      };
    }
  }
}
