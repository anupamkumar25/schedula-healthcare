import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';

@Controller('analytics')
@UseGuards(JwtAuthGuard)
export class AnalyticsController {
	constructor(private readonly analyticsService: AnalyticsService) {}

	@Get('overview')
	async getOverview(
		@Query('from') from?: string,
		@Query('to') to?: string,
	) {
		return this.analyticsService.getOverview(from, to);
	}

	@Get('doctor')
	async getDoctor(
		@Query('doctorId') doctorId: string,
		@Query('from') from?: string,
		@Query('to') to?: string,
	) {
		return this.analyticsService.getDoctorAnalytics(doctorId, from, to);
	}

	@Get('queue')
	async getQueue(
		@Query('from') from?: string,
		@Query('to') to?: string,
	) {
		return this.analyticsService.getQueueAnalytics(from, to);
	}
}


