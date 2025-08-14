"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SegmentTreeService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const appointment_entity_1 = require("../entities/appointment.entity");
const typeorm_2 = require("typeorm");
const elastic_availability_management_service_1 = require("./elastic-availability-management.service");
let SegmentTreeService = class SegmentTreeService {
    appointmentRepo;
    availabilityManagementService;
    trees = new Map();
    constructor(appointmentRepo, availabilityManagementService) {
        this.appointmentRepo = appointmentRepo;
        this.availabilityManagementService = availabilityManagementService;
    }
    initializeDayTree(doctorId, date, startTime, endTime) {
        console.log('Initializing tree with doctorId:', doctorId);
        const key = `${doctorId}_${date}`;
        const startMinutes = this.timeToMinutes(startTime);
        const endMinutes = this.timeToMinutes(endTime);
        const tree = new SegmentTree(startMinutes, endMinutes);
        this.trees.set(key, tree);
        console.log(`Initialized segment tree for ${doctorId} on ${date}: ${startTime}-${endTime}`);
        return tree;
    }
    findOptimalSlot(doctorId, date, durationMinutes) {
        const key = `${doctorId}_${date}`;
        const tree = this.trees.get(key);
        if (!tree) {
            console.log(`No segment tree found for ${key}`);
            return null;
        }
        const optimalSlot = tree.findBestSlot(durationMinutes);
        if (optimalSlot !== null) {
            console.log(`Found optimal slot at ${this.minutesToTime(optimalSlot)} for ${durationMinutes}min`);
        }
        return optimalSlot;
    }
    bookSlot(doctorId, date, startMinutes, endMinutes) {
        const key = `${doctorId}_${date}`;
        const tree = this.trees.get(key);
        if (tree) {
            tree.bookSlot(startMinutes, endMinutes);
            console.log(`Booked slot ${this.minutesToTime(startMinutes)}-${this.minutesToTime(endMinutes)}`);
        }
    }
    addSlots(doctorId, date, newStartTime, newEndTime) {
        const key = `${doctorId}_${date}`;
        const tree = this.trees.get(key);
        if (tree) {
            const startMin = this.timeToMinutes(newStartTime);
            const endMin = this.timeToMinutes(newEndTime);
            tree.expandCapacity(startMin, endMin);
            console.log(`Added slots ${newStartTime}-${newEndTime} to ${key}`);
        }
    }
    timeToMinutes(time) {
        const [hours, minutes] = time.split(':').map(Number);
        return hours * 60 + minutes;
    }
    minutesToTime(minutes) {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
    }
    async buildAndPopulateTree(doctorId, date, availability) {
        if (!availability) {
            console.log(`No availability for ${doctorId} on ${date} to build tree.`);
            return null;
        }
        const tree = this.initializeDayTree(doctorId, date, availability.startTime, availability.endTime);
        const existingAppointments = await this.appointmentRepo.find({
            where: {
                doctorId,
                appointmentDate: date,
                status: appointment_entity_1.AppointmentStatus.UPCOMING,
                appointmentTime: (0, typeorm_2.Between)(availability.startTime, availability.endTime),
            },
        });
        for (const appt of existingAppointments) {
            const startMinutes = this.timeToMinutes(appt.appointmentTime);
            const endMinutes = startMinutes + appt.duration;
            tree.bookSlot(startMinutes, endMinutes);
        }
        console.log(`Rebuilt tree for ${date} with ${existingAppointments.length} existing appointments.`);
        return tree;
    }
};
exports.SegmentTreeService = SegmentTreeService;
exports.SegmentTreeService = SegmentTreeService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(appointment_entity_1.Appointment)),
    __param(1, (0, common_1.Inject)((0, common_1.forwardRef)(() => elastic_availability_management_service_1.AvailabilityManagementService))),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        elastic_availability_management_service_1.AvailabilityManagementService])
], SegmentTreeService);
class SegmentTree {
    tree;
    size;
    startTime;
    endTime;
    constructor(startMinutes, endMinutes) {
        this.startTime = startMinutes;
        this.endTime = endMinutes;
        this.size = endMinutes - startMinutes;
        this.tree = new Array(4 * this.size).fill(0);
    }
    findBestSlot(duration) {
        return this.findSlotRecursive(0, 0, this.size - 1, duration);
    }
    findSlotRecursive(node, start, end, duration) {
        const segmentLength = end - start + 1;
        if (this.tree[node] === 2 || segmentLength < duration) {
            return null;
        }
        if (this.tree[node] === 0) {
            return this.startTime + start;
        }
        if (start === end) {
            return null;
        }
        const mid = Math.floor((start + end) / 2);
        const leftResult = this.findSlotRecursive(2 * node + 1, start, mid, duration);
        if (leftResult !== null) {
            return leftResult;
        }
        return this.findSlotRecursive(2 * node + 2, mid + 1, end, duration);
    }
    bookSlot(startMinutes, endMinutes) {
        const relativeStart = startMinutes - this.startTime;
        const relativeEnd = endMinutes - this.startTime;
        this.updateRange(0, 0, this.size - 1, relativeStart, relativeEnd - 1);
    }
    updateRange(node, start, end, l, r) {
        if (l > end || r < start)
            return;
        if (l <= start && end <= r) {
            this.tree[node] = 2;
            return;
        }
        const mid = Math.floor((start + end) / 2);
        this.updateRange(2 * node + 1, start, mid, l, r);
        this.updateRange(2 * node + 2, mid + 1, end, l, r);
        const left = this.tree[2 * node + 1];
        const right = this.tree[2 * node + 2];
        if (left === 2 && right === 2) {
            this.tree[node] = 2;
        }
        else if (left === 0 && right === 0) {
            this.tree[node] = 0;
        }
        else {
            this.tree[node] = 1;
        }
    }
    expandCapacity(newStart, newEnd) {
        console.log(`Expanding tree capacity from ${this.startTime}–${this.endTime} to ${newStart}–${newEnd}`);
        const newSize = newEnd - newStart;
        const newTreeSize = 2 * Math.pow(2, Math.ceil(Math.log2(newSize))) - 1;
        const newTree = new Array(newTreeSize).fill(0);
        const newSegmentTree = new SegmentTree(newStart, newEnd);
        newSegmentTree.tree = newTree;
        for (let i = 0; i < this.size; i++) {
            const slotStart = this.startTime + i;
            if (this.getSlotState(i) === 2) {
                newSegmentTree.bookSlot(slotStart, slotStart + 1);
            }
        }
        this.startTime = newStart;
        this.endTime = newEnd;
        this.size = newSize;
        this.tree = newSegmentTree.tree;
    }
    getSlotState(index) {
        const leafIndex = this.getLeafIndex(index);
        return this.tree[leafIndex];
    }
    getLeafIndex(index) {
        let pos = 0;
        let start = 0;
        let end = this.size - 1;
        while (start !== end) {
            const mid = Math.floor((start + end) / 2);
            if (index <= mid) {
                pos = 2 * pos + 1;
                end = mid;
            }
            else {
                pos = 2 * pos + 2;
                start = mid + 1;
            }
        }
        return pos;
    }
    debugTree() {
        return {
            startTime: this.startTime,
            endTime: this.endTime,
            size: this.size,
            first30: this.tree.slice(0, 30),
        };
    }
}
//# sourceMappingURL=segment-tree.service.js.map