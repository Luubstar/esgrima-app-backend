import { ApiProperty } from '@nestjs/swagger';
export class CreatePouleDto {
  @ApiProperty({ 
    example: "Poule viernes",
  })
  readonly Nombre: string; 

  @ApiProperty({ example: '' })
  readonly Creador: string;

  @ApiProperty({ example: [""] })
  readonly Tiradores: string[];

  @ApiProperty()
  readonly Valores: number[];
}