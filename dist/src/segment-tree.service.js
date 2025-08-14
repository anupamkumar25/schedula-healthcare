"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SegmentTreeService = void 0;
const common_1 = require("@nestjs/common");
let SegmentTreeService = class SegmentTreeService {
    trees = new Map();
    initializeDayTree(doctorId, date, startTime, endTime) {
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
};
exports.SegmentTreeService = SegmentTreeService;
exports.SegmentTreeService = SegmentTreeService = __decorate([
    (0, common_1.Injectable)()
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
        if (end - start + 1 < duration)
            return null;
        if (this.tree[node] === 2)
            return null;
        if (end - start + 1 === duration && this.tree[node] === 0) {
            return this.startTime + start;
        }
        const mid = Math.floor((start + end) / 2);
        const leftChild = 2 * node + 1;
        const rightChild = 2 * node + 2;
        const leftResult = this.findSlotRecursive(leftChild, start, mid, duration);
        if (leftResult !== null)
            return leftResult;
        return this.findSlotRecursive(rightChild, mid + 1, end, duration);
    }
    bookSlot(startMinutes, endMinutes) {
        const relativeStart = startMinutes - this.startTime;
        const relativeEnd = endMinutes - this.endTime;
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
}
//# sourceMappingURL=segment-tree.service.js.map