import { Test, TestingModule } from '@nestjs/testing';
import { EstadisticasService } from './estadisticas.service';
import { MongooseModule } from '@nestjs/mongoose';
import { EstadisticaSchema, Estadisticas } from './schemas/estadistica.schema';
import { EstadisticasController } from './estadisticas.controller';
import { UsuarioModule } from '../usuarios/usuario.module';
import { CreateEstadisticaDto } from './dto/create-estadistica.dto';
import { Certificate } from 'crypto';
import { HttpStatus } from '@nestjs/common';
import { CreateUsuarioDto } from '../usuarios/dto/create-usuario.dto';
import { UsuarioService } from '../usuarios/usuario.service';

const httpMocks = require('node-mocks-http');

describe('EstadisticasService', () => {
  jest.setTimeout(20000)
  let service: EstadisticasService;
  let uSer : UsuarioService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({imports: [
      MongooseModule.forRoot("mongodb+srv://Admin:LuubStar1@mainserver.r4fjvrb.mongodb.net/Tests"),
      MongooseModule.forFeature([{ name: Estadisticas.name, schema: EstadisticaSchema}]), UsuarioModule
    ],
      controllers: [EstadisticasController],
      providers: [EstadisticasService]}).compile();

    service = module.get<EstadisticasService>(EstadisticasService);
    uSer = module.get<UsuarioService>(UsuarioService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  let createdEst;
  let Adoc = new CreateEstadisticaDto()
  Adoc["Usuario"] = "A";
  let Bdoc = new CreateEstadisticaDto()
  Bdoc["Usuario"] = "B";

  let tdoc = new CreateEstadisticaDto()
  tdoc["Usuario"] = "Z";
  let tdoc2 = new CreateEstadisticaDto()
  tdoc2["Usuario"] = "Z2";
  describe("Funciones", () => {

    beforeAll(async () => {
      service.getModel().deleteMany({});
      uSer.getModel().deleteMany({});
      
      let res = httpMocks.createResponse();
      createdEst = (await service.create(new CreateEstadisticaDto(), "a", res));
    });
  
    afterAll(async () => {
      let req = httpMocks.createRequest();
      await service.remove(createdEst["_id"]);
      expect((await service.findAll(req)).length).toBe(0);
      service.getModel().deleteMany({});
      uSer.getModel().deleteMany({});
    });

    it("should create and check", async() => {
      let res = httpMocks.createResponse();
      await service.create(new CreateEstadisticaDto(), "", res);
      expect(res.statusCode).toBe(HttpStatus.CONFLICT);

      res = httpMocks.createResponse();
      let est = await service.create(tdoc, "Z", res);
      expect(est["Usuario"]).toBe("Z");

      res = httpMocks.createResponse();
      await service.create(tdoc, "Z", res);
      expect(res.statusCode).toBe(HttpStatus.CONFLICT);
      await service.remove(est["_id"]);
    });
    it("should update", async() => {
      expect((await service.update(createdEst["_id"], Bdoc))["Usuario"].toString()).toBe("B");
      expect((await service.update(createdEst["_id"], Adoc))["Usuario"].toString()).toBe("A");
    });

    describe("Buscar", () => {
      it("should find all", async() => {
        let req = httpMocks.createRequest();
        expect((await service.findAll(req)).length).toBeGreaterThan(0);
      });
  
      it("should find one", async() => {
        expect((await service.findOne(createdEst["_id"]))["_id"].toString()).toBe(createdEst["_id"].toString());
      });

      it("should find by user, month and year", async() => {
        let res = httpMocks.createResponse();
        let est = await service.create(tdoc2, "Z2", res);

        let u = await service.getFromUser(est["Usuario"], est["Mes"], est["Año"]);
        expect(u["_id"].toString()).toBe(est["_id"].toString());
        service.remove(est["_id"]);
      });
  
    });
    
  });
});
