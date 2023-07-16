import { Test, TestingModule } from '@nestjs/testing';
import { UsuarioController } from './usuario.controller';
import { UsuarioService } from './usuario.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Usuario, UsuarioSchema } from './schemas/usuario.schema';
import { PoulesModule } from '../poules/poules.module';

describe('UsuarioController', () => {
  let controller: UsuarioController;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [MongooseModule.forRoot("mongodb+srv://Admin:LuubStar1@mainserver.r4fjvrb.mongodb.net/Tests"),       
      MongooseModule.forFeature([{ name: Usuario.name, schema: UsuarioSchema}]), PoulesModule],
      controllers: [UsuarioController],
      providers: [UsuarioService, UsuarioController],
    }).compile();
    
    controller = module.get<UsuarioController>(UsuarioController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
