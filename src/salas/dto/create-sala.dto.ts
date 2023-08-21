import { ApiProperty } from '@nestjs/swagger';
export class CreateSalaDto {
  @ApiProperty({ 
    example: "SAJI",default: ""
  })
  Nombre: string; 

}