import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  ValidationPipe,
} from '@nestjs/common';
import { AvailabilityService } from './availability.service';
import { CreateAvailabilityDto } from './create-availability.dto';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';

interface AuthenticatedRequest extends Request {
  user: {
    userId: string;
  };
}

@Controller('availability')
@UseGuards(JwtAuthGuard)
export class AvailabilityController {
  constructor(private availabilityService: AvailabilityService) {}

  @Post()
  async createAvailability(
    @Request() req: AuthenticatedRequest,
    @Body(ValidationPipe) createAvailabilityDto: CreateAvailabilityDto,
  ) {
    const doctorId = req.user.userId;
    return this.availabilityService.createAvailability(
      doctorId,
      createAvailabilityDto,
    );
  }

  @Get()
  async getDoctorAvailabilities(@Request() req: AuthenticatedRequest) {
    const doctorId = req.user.userId;

    return this.availabilityService.getDoctorAvailabilities(doctorId);
  }

  @Get('doctor/:doctorId')
  async getSpecificDoctorAvailabilities(@Param('doctorId') doctorId: string) {
    return this.availabilityService.getDoctorAvailabilities(doctorId);
  }

  @Put(':availabilityId')
  async updateAvailability(
    @Request() req: AuthenticatedRequest,
    @Param('availabilityId') availabilityId: string,
    @Body(ValidationPipe) updateData: Partial<CreateAvailabilityDto>,
  ) {
    const doctorId = req.user.userId;
    return this.availabilityService.updateAvailability(
      doctorId,
      availabilityId,
      updateData,
    );
  }

  @Delete(':availabilityId')
  async deleteAvailability(
    @Request() req: AuthenticatedRequest,
    @Param('availabilityId') availabilityId: string,
  ) {
    const doctorId = req.user.userId;
    return this.availabilityService.deleteAvailability(
      doctorId,
      availabilityId,
    );
  }
}
