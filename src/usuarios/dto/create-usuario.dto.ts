import { ApiProperty } from '@nestjs/swagger';
export class CreateUsuarioDto {
  @ApiProperty({ 
    example: "Nicolas Barona Riera",
  })
  Nombre: string;
  
  @ApiProperty({ example: 'ejemplo@gmail.com' })
  Correo: string;

  @ApiProperty({ example: "<password>" })
  Clave: string;

  @ApiProperty({ example: "" })
  Imagen64: string;

  @ApiProperty({ default: "SAJI" })
  Sala: string;

  @ApiProperty({ default: "Tirador" })
  Nivel: string;
  
}