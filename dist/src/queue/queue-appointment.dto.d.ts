export declare enum FlexibilityType {
    FLEXIBLE = "flexible",
    MODERATE = "moderate",
    STRICT = "strict"
}
export declare class QueueAppointmentDDto {
    doctorId: string;
    requestedDate: string;
    preferredTime?: string;
    flexibility: FlexibilityType;
    appointmentType: string;
    complaint?: string;
}
