import { Module } from '@nestjs/common';
import { EstadisticasService } from './estadisticas.service';
import { EstadisticasController } from './estadisticas.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { EstadisticaSchema, Estadisticas } from './schemas/estadistica.schema';
import { UsuarioModule } from '../usuarios/usuario.module';
@Module({imports: [
  MongooseModule.forFeature([{ name: Estadisticas.name, schema: EstadisticaSchema}]), UsuarioModule
],
  controllers: [EstadisticasController],
  providers: [EstadisticasService]
})
export class EstadisticasModule {}
