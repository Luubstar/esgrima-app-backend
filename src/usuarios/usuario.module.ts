import { forwardRef, Module } from '@nestjs/common';
import { UsuarioService } from './usuario.service';
import { UsuarioController } from './usuario.controller';
import { Usuario, UsuarioSchema } from './schemas/usuario.schema';
import { PoulesModuleMock } from '../poules/poules.module.mock';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Usuario.name, schema: UsuarioSchema}]), PoulesModuleMock
  ],
  controllers: [UsuarioController],
  providers: [UsuarioService, UsuarioController],
  exports: [UsuarioService, UsuarioModule, UsuarioController]
})
export class UsuarioModule {}