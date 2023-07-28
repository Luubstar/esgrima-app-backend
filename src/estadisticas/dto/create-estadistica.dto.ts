import { ApiProperty } from '@nestjs/swagger';
export class CreateEstadisticaDto {

  @ApiProperty({readOnly : true}) 
  Usuario: string

  @ApiProperty({readOnly : true})
  Mes: number;

  @ApiProperty({readOnly : true})
  Año : number

  @ApiProperty({default : 0, example: 0})
  Victorias : number

  @ApiProperty({default : 0, example: 0})
  Derrotas : number

  @ApiProperty({default : 0, example: 0})
  TocadosDados : number

  @ApiProperty({default : 0, example: 0})
  TocadosRecibidos : number

  @ApiProperty({default : 0, example: 0})
  PoulesTotales : number
}