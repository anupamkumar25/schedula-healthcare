import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  UseGuards,
  Request,
  ValidationPipe,
  BadRequestException,
} from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { CreateAppointmentDto } from './create-appointment.dto';

interface AuthenticatedRequest extends Request {
  user: {
    userId: string;
  };
}

@Controller('Appointments')
@UseGuards(JwtAuthGuard)
export class AppointmentsController {
  constructor(private appointmentsService: AppointmentsService) {}

  private validateAppointmentId(appointmentId: string): void {
    if (!appointmentId || appointmentId === 'null' || appointmentId === 'undefined') {
      throw new BadRequestException('Invalid appointment ID provided');
    }
  }

  @Post()
  async createAppointment(
    @Request() req: AuthenticatedRequest,
    @Body(ValidationPipe) createAppointmentDto: CreateAppointmentDto,
  ) {
    const patientId = req.user.userId;
    return this.appointmentsService.createAppointment(
      patientId,
      createAppointmentDto,
    );
  }

  @Get('patient')
  async getPatientAppointments(@Request() req: AuthenticatedRequest) {
    const patientId = req.user.userId;
    return this.appointmentsService.getPatientAppointments(patientId);
  }

  @Get('doctor')
  async getDoctorAppointments(@Request() req: AuthenticatedRequest) {
    const doctorId = req.user.userId;
    return this.appointmentsService.getDoctorAppointments(doctorId);
  }

  @Get(':appointmentId')
  async getAppointmentById(@Param('appointmentId') appointmentId: string) {
    this.validateAppointmentId(appointmentId);
    return this.appointmentsService.getAppointmentsById(appointmentId);
  }

  @Get('queue/:queueId')
  async getAppointmentFromQueue(@Param('queueId') queueId: string) {
    return this.appointmentsService.getAppointmentFromQueue(queueId);
  }

  @Put(':appointmentId/cancel')
  async cancelAppointment(
    @Request() req: AuthenticatedRequest,
    @Param('appointmentId') appointmentId: string,
  ) {
    this.validateAppointmentId(appointmentId);
    const userId = req.user.userId;
    return this.appointmentsService.cancelAppointment(appointmentId, userId);
  }
}
