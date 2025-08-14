export declare enum UserType {
    PATIENT = "patient",
    DOCTOR = "doctor"
}
export declare class LoginDto {
    email: string;
    password: string;
    userType: UserType;
}
