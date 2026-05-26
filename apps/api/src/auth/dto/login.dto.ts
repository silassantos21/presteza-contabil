import { IsEmail, IsString, MinLength } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class LoginDto {
  @ApiProperty({ example: 'admin@presteza.com.br' })
  @IsEmail({}, { message: 'E-mail inválido' })
  email: string

  @ApiProperty({ example: 'senha123' })
  @IsString()
  @MinLength(6, { message: 'Senha deve ter ao menos 6 caracteres' })
  password: string
}
