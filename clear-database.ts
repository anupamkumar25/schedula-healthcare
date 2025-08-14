import { AppDataSource } from './src/database/data-source';
import { Patient } from './src/entities/patient.entity';
import { Doctor } from './src/entities/doctor.entity';
import { Availability } from './src/entities/availability.entity';
import { Appointment } from './src/entities/appointment.entity';
import { AppointmentQueue } from './src/entities/appointment-queue.entity';
import { TemporaryAvailability } from './src/entities/temporary-availability.entity';
import { Message } from './src/entities/message-entities';

async function clearDatabase() {
  try {
    // Initialize database connection
    await AppDataSource.initialize();
    console.log('Database connection established');

    // Use raw SQL queries to handle foreign key constraints properly
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();

    console.log('Clearing appointment-related data...');
    await queryRunner.query('DELETE FROM "Appointments"');
    await queryRunner.query('DELETE FROM "appointment-queue"');

    console.log('Clearing availability data...');
    await queryRunner.query('DELETE FROM "temporary-availability"');
    await queryRunner.query('DELETE FROM "availabilities"');

    console.log('Clearing chat messages...');
    await queryRunner.query('DELETE FROM "message"');

    console.log('Clearing user data...');
    await queryRunner.query('DELETE FROM "patients"');
    await queryRunner.query('DELETE FROM "doctors"');

    await queryRunner.release();

    console.log('✅ Database cleared successfully!');

    // Verify tables are empty using repositories
    const appointmentRepo = AppDataSource.getRepository(Appointment);
    const queueRepo = AppDataSource.getRepository(AppointmentQueue);
    const availabilityRepo = AppDataSource.getRepository(Availability);
    const patientRepo = AppDataSource.getRepository(Patient);
    const doctorRepo = AppDataSource.getRepository(Doctor);

    const appointmentCount = await appointmentRepo.count();
    const queueCount = await queueRepo.count();
    const availabilityCount = await availabilityRepo.count();
    const patientCount = await patientRepo.count();
    const doctorCount = await doctorRepo.count();

    console.log('\n📊 Verification:');
    console.log(`Appointments: ${appointmentCount}`);
    console.log(`Queue entries: ${queueCount}`);
    console.log(`Availabilities: ${availabilityCount}`);
    console.log(`Patients: ${patientCount}`);
    console.log(`Doctors: ${doctorCount}`);

  } catch (error) {
    console.error('❌ Error clearing database:', error);
  } finally {
    await AppDataSource.destroy();
    console.log('Database connection closed');
  }
}

// Run the script
clearDatabase();
