
import { ApiProperty } from '@nestjs/swagger';
export class changeEstadoDto {
    @ApiProperty()
    readonly Vencedores: string[];
}