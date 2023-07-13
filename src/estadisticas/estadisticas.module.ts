import { Module } from '@nestjs/common';
import { EstadisticasService } from './estadisticas.service';
import { EstadisticasController } from './estadisticas.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Estadisticas } from './schemas/estadistica.schema';
import { UsuarioSchema } from 'src/usuarios/schemas/usuario.schema';
import { UsuarioModule } from 'src/usuarios/usuario.module';
@Module({imports: [
  MongooseModule.forFeature([{ name: Estadisticas.name, schema: UsuarioSchema}]), UsuarioModule
],
  controllers: [EstadisticasController],
  providers: [EstadisticasService]
})
export class EstadisticasModule {}
