import { ApiProperty } from '@nestjs/swagger';
export class CreateEstadisticaDto {

  @ApiProperty({readOnly : true}) 
  Usuario: string

  @ApiProperty({readOnly : true})
  Mes: number;

  @ApiProperty({readOnly : true})
  Año : number

  @ApiProperty({default : 0, example: 0})
  readonly Victorias : number

  @ApiProperty({default : 0, example: 0})
  readonly Derrotas : number

  @ApiProperty({default : 0, example: 0})
  readonly TocadosDados : number

  @ApiProperty({default : 0, example: 0})
  readonly TocadosRecividos : number

  @ApiProperty({default : 0, example: 0})
  readonly PoulesTotales : number
}