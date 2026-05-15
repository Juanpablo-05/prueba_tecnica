import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
  IsBoolean,
} from 'class-validator';

export class AdminCreateUserDto {
  @IsNotEmpty()
  @IsString()
  fullName!: string;

  @IsNotEmpty()
  @IsString()
  document!: string;

  @IsNotEmpty()
  @IsEmail()
  email!: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(5, { message: 'La contraseña debe tener al menos 5 caracteres' })
  password!: string;

  @IsNotEmpty()
  @IsEnum(['DOCTOR', 'PATIENT'], {
    message: 'El rol debe ser DOCTOR o PATIENT',
  })
  role!: 'DOCTOR' | 'PATIENT';

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsString()
  medicalLicenseNumber?: string | "N/A";
}
