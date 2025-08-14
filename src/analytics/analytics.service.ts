import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
	Repository,
	Between,
	MoreThanOrEqual,
	LessThanOrEqual,
	FindOperator,
} from 'typeorm';
import { Appointment, AppointmentStatus } from '../entities/appointment.entity';
import { AppointmentQueue, QueueStatus } from '../entities/appointment-queue.entity';

type DateRange = { from?: string; to?: string };

function buildDateWhere(range?: DateRange): FindOperator<string> | undefined {
	if (!range) return undefined;
	const { from, to } = range;
	if (from && to) return Between(from, to);
	if (from) return MoreThanOrEqual(from);
	if (to) return LessThanOrEqual(to);
	return undefined;
}

@Injectable()
export class AnalyticsService {
	constructor(
		@InjectRepository(Appointment)
		private readonly appointmentRepo: Repository<Appointment>,
		@InjectRepository(AppointmentQueue)
		private readonly queueRepo: Repository<AppointmentQueue>,
	) {}

	async getOverview(from?: string, to?: string) {
		const dateOp = buildDateWhere({ from, to });

		// Appointments
		const totalWhere = dateOp
			? ({ appointmentDate: dateOp } as const)
			: undefined;
		const totalAppointments = await this.appointmentRepo.count({ where: totalWhere });

		const upcomingWhere: any = { status: AppointmentStatus.UPCOMING };
		if (dateOp) upcomingWhere.appointmentDate = dateOp;
		const completedWhere: any = { status: AppointmentStatus.COMPLETED };
		if (dateOp) completedWhere.appointmentDate = dateOp;
		const cancelledWhere: any = { status: AppointmentStatus.CANCELLED };
		if (dateOp) cancelledWhere.appointmentDate = dateOp;

		const [upcoming, completed, cancelled] = await Promise.all([
			this.appointmentRepo.count({ where: upcomingWhere }),
			this.appointmentRepo.count({ where: completedWhere }),
			this.appointmentRepo.count({ where: cancelledWhere }),
		]);

		// Queue
		const pendingWhere: any = { status: QueueStatus.PENDING };
		if (dateOp) pendingWhere.requestedDate = dateOp;
		const scheduledWhere: any = { status: QueueStatus.SCHEDULED };
		if (dateOp) scheduledWhere.requestedDate = dateOp;
		const failedWhere: any = { status: QueueStatus.FAILED };
		if (dateOp) failedWhere.requestedDate = dateOp;

		const [queuePending, queueScheduled, queueFailed] = await Promise.all([
			this.queueRepo.count({ where: pendingWhere }),
			this.queueRepo.count({ where: scheduledWhere }),
			this.queueRepo.count({ where: failedWhere }),
		]);

		return {
			success: true,
			data: {
				totalAppointments,
				statusBreakdown: { upcoming, completed, cancelled },
				queue: { pending: queuePending, scheduled: queueScheduled, failed: queueFailed },
			},
		};
	}

	async getDoctorAnalytics(doctorId: string, from?: string, to?: string) {
		const dateOp = buildDateWhere({ from, to });

		const apptWhere: any = { doctorId };
		if (dateOp) apptWhere.appointmentDate = dateOp;
		const queueWhere: any = { doctorId };
		if (dateOp) queueWhere.requestedDate = dateOp;

		const [appointments, queue] = await Promise.all([
			this.appointmentRepo.count({ where: apptWhere }),
			this.queueRepo.count({ where: queueWhere }),
		]);

		const completedWhere: any = { doctorId, status: AppointmentStatus.COMPLETED };
		if (dateOp) completedWhere.appointmentDate = dateOp;
		const cancelledWhere: any = { doctorId, status: AppointmentStatus.CANCELLED };
		if (dateOp) cancelledWhere.appointmentDate = dateOp;
		const upcomingWhere: any = { doctorId, status: AppointmentStatus.UPCOMING };
		if (dateOp) upcomingWhere.appointmentDate = dateOp;

		const [completed, cancelled, upcoming] = await Promise.all([
			this.appointmentRepo.count({ where: completedWhere }),
			this.appointmentRepo.count({ where: cancelledWhere }),
			this.appointmentRepo.count({ where: upcomingWhere }),
		]);

		return {
			success: true,
			data: {
				appointments,
				queue,
				statusBreakdown: { upcoming, completed, cancelled },
			},
		};
	}

	async getQueueAnalytics(from?: string, to?: string) {
		const dateOp = buildDateWhere({ from, to });

		const pendingWhere: any = { status: QueueStatus.PENDING };
		if (dateOp) pendingWhere.requestedDate = dateOp;
		const scheduledWhere: any = { status: QueueStatus.SCHEDULED };
		if (dateOp) scheduledWhere.requestedDate = dateOp;
		const failedWhere: any = { status: QueueStatus.FAILED };
		if (dateOp) failedWhere.requestedDate = dateOp;

		const [pending, scheduled, failed] = await Promise.all([
			this.queueRepo.count({ where: pendingWhere }),
			this.queueRepo.count({ where: scheduledWhere }),
			this.queueRepo.count({ where: failedWhere }),
		]);

		return { success: true, data: { pending, scheduled, failed } };
	}
}


