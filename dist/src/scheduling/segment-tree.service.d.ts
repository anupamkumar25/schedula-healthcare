import { Appointment } from '../entities/appointment.entity';
import { Repository } from 'typeorm';
import { AvailabilityManagementService } from './elastic-availability-management.service';
export declare class SegmentTreeService {
    private appointmentRepo;
    private availabilityManagementService;
    private trees;
    constructor(appointmentRepo: Repository<Appointment>, availabilityManagementService: AvailabilityManagementService);
    initializeDayTree(doctorId: string, date: string, startTime: string, endTime: string): SegmentTree;
    findOptimalSlot(doctorId: string, date: string, durationMinutes: number): number | null;
    bookSlot(doctorId: string, date: string, startMinutes: number, endMinutes: number): void;
    addSlots(doctorId: string, date: string, newStartTime: string, newEndTime: string): void;
    private timeToMinutes;
    private minutesToTime;
    buildAndPopulateTree(doctorId: string, date: string, availability: {
        startTime: string;
        endTime: string;
    }): Promise<SegmentTree | null>;
}
declare class SegmentTree {
    private tree;
    private size;
    private startTime;
    private endTime;
    constructor(startMinutes: number, endMinutes: number);
    findBestSlot(duration: number): number | null;
    private findSlotRecursive;
    bookSlot(startMinutes: number, endMinutes: number): void;
    private updateRange;
    expandCapacity(newStart: number, newEnd: number): void;
    private getSlotState;
    getLeafIndex(index: number): number;
    debugTree(): {
        startTime: number;
        endTime: number;
        size: number;
        first30: number[];
    };
}
export {};
