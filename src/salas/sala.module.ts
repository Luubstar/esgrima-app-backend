import { Module } from '@nestjs/common';
import { SalaService } from './sala.service';
import { SalaController } from './sala.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Sala, SalaSchema } from './schemas/sala.schema';
import { UsuarioModule } from '../usuarios/usuario.module';
import { EstadisticasModule } from 'src/estadisticas/estadisticas.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Sala.name, schema: SalaSchema }]), UsuarioModule, EstadisticasModule
  ],
  controllers: [SalaController],
  providers: [SalaService],
})
export class SalaModule {}