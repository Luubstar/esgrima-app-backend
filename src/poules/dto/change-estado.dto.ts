
import { ApiProperty } from '@nestjs/swagger';
export class changeEstadoDto {
    @ApiProperty()
    readonly Estado: number;
}