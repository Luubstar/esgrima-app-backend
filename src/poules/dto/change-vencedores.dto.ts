
import { ApiProperty } from '@nestjs/swagger';
export class changePouleVencedores {
    @ApiProperty()
    readonly Vencedores: string[];
}