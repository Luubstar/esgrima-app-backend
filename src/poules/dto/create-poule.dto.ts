import { ApiProperty } from '@nestjs/swagger';
export class CreatePouleDto {
  @ApiProperty({ 
    example: "Poule viernes",
  })
  Nombre: string; 

  @ApiProperty({ example: '' })
  Creador: string;

  @ApiProperty({ example: [""] })
  Tiradores: string[];

  @ApiProperty()
  Valores: number[];

  @ApiProperty({default: 1})
  readonly Estado: number
}