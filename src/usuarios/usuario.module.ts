import { forwardRef, Module } from '@nestjs/common';
import { UsuarioService } from './usuario.service';
import { UsuarioController } from './usuario.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Usuario, UsuarioSchema } from './schemas/usuario.schema';
import { PoulesModule } from 'src/poules/poules.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Usuario.name, schema: UsuarioSchema}]),forwardRef(() => PoulesModule)
  ],
  controllers: [UsuarioController],
  providers: [UsuarioService, UsuarioController],
  exports: [UsuarioService, UsuarioModule, UsuarioController]
})
export class UsuarioModule {}