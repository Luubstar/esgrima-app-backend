
import { ApiProperty } from '@nestjs/swagger';
export class changeValoresDto {
    @ApiProperty()
    readonly Valores: number[];
}