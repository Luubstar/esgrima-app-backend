import { Test, TestingModule } from '@nestjs/testing';
import { EstadisticasController } from './estadisticas.controller';
import { EstadisticasService } from './estadisticas.service';
import { MongooseModule } from '@nestjs/mongoose';
import { EstadisticaSchema, Estadisticas } from './schemas/estadistica.schema';
import { UsuarioModule } from '../usuarios/usuario.module';
import { UsuarioService } from '../usuarios/usuario.service';
import { HttpStatus } from '@nestjs/common';
const httpMocks = require('node-mocks-http');

describe('EstadisticasController', () => {
  jest.setTimeout(20000)
  let controller: EstadisticasController;
  let service: EstadisticasService;
  let uSer : UsuarioService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({imports: [
      MongooseModule.forRoot("mongodb+srv://Admin:LuubStar1@mainserver.r4fjvrb.mongodb.net/Tests"),
      MongooseModule.forFeature([{ name: Estadisticas.name, schema: EstadisticaSchema}]), UsuarioModule
    ],
      controllers: [EstadisticasController],
      providers: [EstadisticasService]}).compile();

    controller = module.get<EstadisticasController>(EstadisticasController);
    service = module.get<EstadisticasService>(EstadisticasService);
    uSer = module.get<UsuarioService>(UsuarioService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe("Find actions", () =>{
    it ("should find all", async () => {
      let res = httpMocks.createResponse();
      let req = httpMocks.createRequest();
      jest.spyOn(service,'findAll').mockResolvedValue(new Estadisticas()[1]); 

      await controller.findAll(req,res);
      expect(res.statusCode).toBe(HttpStatus.OK);
    })

    it ("should find one by id", async () => {
      let res = httpMocks.createResponse();
      jest.spyOn(service,'findOne').mockResolvedValue(new Estadisticas()); 

      await controller.findOne("", res);
      expect(res.statusCode).toBe(HttpStatus.OK);
    })

    it ("should find one by user data", async () => {
      let res = httpMocks.createResponse();
      jest.spyOn(service,'getFromUser').mockResolvedValue(new Estadisticas()); 

      await controller.GetByUser("",0,0, res);
      expect(res.statusCode).toBe(HttpStatus.OK);
    })
  });
});
