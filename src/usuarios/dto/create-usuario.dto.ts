import { ApiProperty } from '@nestjs/swagger';
export class CreateUsuarioDto {
  @ApiProperty({ 
    example: "Nicolas Barona Riera",
  })
  readonly Nombre: string;
  
  @ApiProperty({ example: 'ejemplo@gmail.com' })
  readonly Correo: string;

  @ApiProperty({ example: "<password>" })
  readonly Clave: string;

  @ApiProperty({ example: "" })
  readonly Imagen64: string;


}