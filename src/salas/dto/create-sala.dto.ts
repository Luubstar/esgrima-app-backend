import { ApiProperty } from '@nestjs/swagger';
export class CreateSalaDto {
  @ApiProperty({ 
    example: "SAJI",
  })
  readonly Nombre: string; 

  @ApiProperty({ 
    example: "Espada",
  })
  readonly Armas: string; 
}