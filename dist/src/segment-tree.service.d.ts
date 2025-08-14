export declare class SegmentTreeService {
    private trees;
    initializeDayTree(doctorId: string, date: string, startTime: string, endTime: string): SegmentTree;
    findOptimalSlot(doctorId: string, date: string, durationMinutes: number): number | null;
    bookSlot(doctorId: string, date: string, startMinutes: number, endMinutes: number): void;
    addSlots(doctorId: string, date: string, newStartTime: string, newEndTime: string): void;
    private timeToMinutes;
    private minutesToTime;
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
}
export {};
