import { forwardRef, Module } from '@nestjs/common';
import { PoulesService } from './poules.service';
import { PoulesController } from './poules.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Poule, PouleSchema } from './schemas/poule.schema';
import { UsuarioModule } from '../usuarios/usuario.module';
import { EstadisticasModule } from '../estadisticas/estadisticas.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Poule.name, schema: PouleSchema }]), UsuarioModule, EstadisticasModule],
  controllers: [PoulesController],
  providers: [PoulesService],
  exports: [PoulesService, PoulesModule]
})
export class PoulesModule {}