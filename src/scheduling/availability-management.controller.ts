import { Controller, Post, Body, UseGuards, Request, BadRequestException } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { AvailabilityManagementService } from './elastic-availability-management.service';

interface ExpandRequest {
  date?: string; // Optional: specific date (YYYY-MM-DD)
  day?: string; // Optional: day of week (monday, tuesday, etc.)
  newEndTime: string;
}

interface ShrinkRequest {
  date?: string; // Optional: specific date (YYYY-MM-DD)
  day?: string; // Optional: day of week (monday, tuesday, etc.)
  newEndTime: string;
}

export interface AuthenticatedRequest extends Request {
  user: {
    userId: string;
  };
}

@Controller('scheduling')
@UseGuards(JwtAuthGuard)
export class AvailabilityManagementController {
  constructor(private availabilityService: AvailabilityManagementService) {}

  @Post('expand')
  async expandAvailability(
    @Request() req: AuthenticatedRequest,
    @Body() request: ExpandRequest,
  ) {
    const doctorId = req.user.userId;

    // Validate that either date or day is provided
    if (!request.date && !request.day) {
      throw new BadRequestException('Either date or day must be provided');
    }

    return this.availabilityService.expandAvailability(
      doctorId,
      request.newEndTime,
      request.date,
      request.day,
    );
  }

  @Post('shrink')
  async shrinkAvailability(
    @Request() req: AuthenticatedRequest,
    @Body() request: ShrinkRequest,
  ) {
    const doctorId = req.user.userId;

    // Validate that either date or day is provided
    if (!request.date && !request.day) {
      throw new BadRequestException('Either date or day must be provided');
    }

    return this.availabilityService.shrinkAvailability(
      doctorId,
      request.newEndTime,
      request.date,
      request.day,
    );
  }
}
