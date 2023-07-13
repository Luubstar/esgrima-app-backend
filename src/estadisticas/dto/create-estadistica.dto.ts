import { ApiProperty } from '@nestjs/swagger';
export class CreateEstadisticaDto {

  @ApiProperty({example: "ID de usuario, se pone automáticamente"}) 
  Usuario: string

  @ApiProperty({default: 0, example: 0})
  readonly Mes: number;

  @ApiProperty({default: 2023, example: 2023})
  readonly Año : number

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