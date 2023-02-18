import { ApiProperty } from '@nestjs/swagger';
export class CreatePouleDto {
  @ApiProperty({ 
    example: "Poule viernes",
  })
  readonly Nombre: string; 

  @ApiProperty({
    example:
       "Poule", default:"Poule"})
  readonly Tipo: string;

  @ApiProperty({ example: '' })
  readonly Creador: string;

  @ApiProperty({ example: [""] })
  readonly Tiradores: string;
}