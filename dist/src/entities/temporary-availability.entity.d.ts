export declare enum AvailabilityChangeType {
    EXPAND = "expand",
    SHRINK = "shrink"
}
export declare class TemporaryAvailability {
    id: string;
    doctorId: string;
    effectiveDate: string;
    changeType: AvailabilityChangeType;
    originalStartTime: string;
    originalEndTime: string;
    newStartTime: string;
    newEndTime: string;
    affectedAppointment: string[];
    createdAt: Date;
}
