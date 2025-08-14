import { Injectable } from '@nestjs/common';

// interface TimeSlot {
//   startMinutes: number;
//   endMinutes: number;
//   isAAvailable: boolean;
//   appointmentId: string;
// }

@Injectable()
export class SegmentTreeService {
  private trees: Map<string, SegmentTree> = new Map();

  initializeDayTree(
    doctorId: string,
    date: string,
    startTime: string,
    endTime: string,
  ) {
    const key = `${doctorId}_${date}`;
    const startMinutes = this.timeToMinutes(startTime);
    const endMinutes = this.timeToMinutes(endTime);

    const tree = new SegmentTree(startMinutes, endMinutes);
    this.trees.set(key, tree);

    console.log(
      `Initialized segment tree for ${doctorId} on ${date}: ${startTime}-${endTime}`,
    );
    return tree;
  }

  findOptimalSlot(
    doctorId: string,
    date: string,
    durationMinutes: number,
  ): number | null {
    const key = `${doctorId}_${date}`;
    const tree = this.trees.get(key);

    if (!tree) {
      console.log(`No segment tree found for ${key}`);
      return null;
    }

    const optimalSlot = tree.findBestSlot(durationMinutes);

    if (optimalSlot !== null) {
      console.log(
        `Found optimal slot at ${this.minutesToTime(optimalSlot)} for ${durationMinutes}min`,
      );
    }

    return optimalSlot;
  }

  public bookSlot(
    doctorId: string,
    date: string,
    startMinutes: number,
    endMinutes: number,
  ) {
    const key = `${doctorId}_${date}`;
    const tree = this.trees.get(key);

    if (tree) {
      tree.bookSlot(startMinutes, endMinutes);
      console.log(
        `Booked slot ${this.minutesToTime(startMinutes)}-${this.minutesToTime(endMinutes)}`,
      );
    }
  }

  addSlots(
    doctorId: string,
    date: string,
    newStartTime: string,
    newEndTime: string,
  ) {
    const key = `${doctorId}_${date}`;
    const tree = this.trees.get(key);

    if (tree) {
      const startMin = this.timeToMinutes(newStartTime);
      const endMin = this.timeToMinutes(newEndTime);
      tree.expandCapacity(startMin, endMin);

      console.log(`Added slots ${newStartTime}-${newEndTime} to ${key}`);
    }
  }

  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  private minutesToTime(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  }
}

class SegmentTree {
  private tree: number[];
  private size: number;
  private startTime: number;
  private endTime: number;

  constructor(startMinutes: number, endMinutes: number) {
    this.startTime = startMinutes;
    this.endTime = endMinutes;
    this.size = endMinutes - startMinutes;
    this.tree = new Array(4 * this.size).fill(0) as number[];
  }

  findBestSlot(duration: number): number | null {
    return this.findSlotRecursive(0, 0, this.size - 1, duration);
  }

  private findSlotRecursive(
    node: number,
    start: number,
    end: number,
    duration: number,
  ): number | null {
    if (end - start + 1 < duration) return null;
    if (this.tree[node] === 2) return null;

    if (end - start + 1 === duration && this.tree[node] === 0) {
      return this.startTime + start;
    }

    const mid = Math.floor((start + end) / 2);
    const leftChild = 2 * node + 1;
    const rightChild = 2 * node + 2;

    const leftResult = this.findSlotRecursive(leftChild, start, mid, duration);
    if (leftResult !== null) return leftResult;

    return this.findSlotRecursive(rightChild, mid + 1, end, duration);
  }

  bookSlot(startMinutes: number, endMinutes: number) {
    const relativeStart = startMinutes - this.startTime;
    const relativeEnd = endMinutes - this.endTime;

    this.updateRange(0, 0, this.size - 1, relativeStart, relativeEnd - 1);
  }

  private updateRange(
    node: number,
    start: number,
    end: number,
    l: number,
    r: number,
  ) {
    if (l > end || r < start) return;

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
    } else if (left === 0 && right === 0) {
      this.tree[node] = 0;
    } else {
      this.tree[node] = 1;
    }
  }

  expandCapacity(newStart: number, newEnd: number) {
    console.log(
      `Expanding tree capacity from ${this.startTime}–${this.endTime} to ${newStart}–${newEnd}`,
    );

    const newSize = newEnd - newStart;
    const newTreeSize = 2 * Math.pow(2, Math.ceil(Math.log2(newSize))) - 1;
    const newTree = new Array(newTreeSize).fill(0);

    const newSegmentTree = new SegmentTree(newStart, newEnd);
    newSegmentTree.tree = newTree as number[];

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

  private getSlotState(index: number): number {
    const leafIndex = this.getLeafIndex(index);
    return this.tree[leafIndex];
  }

  public getLeafIndex(index: number): number {
    let pos = 0;
    let start = 0;
    let end = this.size - 1;

    while (start !== end) {
      const mid = Math.floor((start + end) / 2);
      if (index <= mid) {
        pos = 2 * pos + 1;
        end = mid;
      } else {
        pos = 2 * pos + 2;
        start = mid + 1;
      }
    }

    return pos;
  }
}
