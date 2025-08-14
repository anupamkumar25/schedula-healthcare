"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const data_source_1 = require("./src/database/data-source");
const patient_entity_1 = require("./src/entities/patient.entity");
const doctor_entity_1 = require("./src/entities/doctor.entity");
const availability_entity_1 = require("./src/entities/availability.entity");
const appointment_entity_1 = require("./src/entities/appointment.entity");
const appointment_queue_entity_1 = require("./src/entities/appointment-queue.entity");
async function clearDatabase() {
    try {
        await data_source_1.AppDataSource.initialize();
        console.log('Database connection established');
        const queryRunner = data_source_1.AppDataSource.createQueryRunner();
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
        const appointmentRepo = data_source_1.AppDataSource.getRepository(appointment_entity_1.Appointment);
        const queueRepo = data_source_1.AppDataSource.getRepository(appointment_queue_entity_1.AppointmentQueue);
        const availabilityRepo = data_source_1.AppDataSource.getRepository(availability_entity_1.Availability);
        const patientRepo = data_source_1.AppDataSource.getRepository(patient_entity_1.Patient);
        const doctorRepo = data_source_1.AppDataSource.getRepository(doctor_entity_1.Doctor);
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
    }
    catch (error) {
        console.error('❌ Error clearing database:', error);
    }
    finally {
        await data_source_1.AppDataSource.destroy();
        console.log('Database connection closed');
    }
}
clearDatabase();
//# sourceMappingURL=clear-database.js.map