import { PartialType } from '@nestjs/swagger';
import { CreatePouleDto } from './create-poule.dto';

export class UpdatePouleDto extends PartialType(CreatePouleDto) {}
