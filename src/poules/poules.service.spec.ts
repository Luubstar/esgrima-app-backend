import { Test, TestingModule } from '@nestjs/testing';
import { PoulesService } from './poules.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Poule, PouleSchema } from './schemas/poule.schema';
import { UsuarioModule } from '../usuarios/usuario.module';
import { PoulesController } from './poules.controller';
import { UsuarioService } from '../usuarios/usuario.service';
import { CreatePouleDto } from './dto/create-poule.dto';
import { changePouleVencedores } from './dto/change-vencedores.dto';
import { Body, HttpStatus } from '@nestjs/common';
import { CreateUsuarioDto } from '../usuarios/dto/create-usuario.dto';
import { changeValoresDto } from './dto/change-valores.dto';
import { Types } from 'mongoose';
import { UpdatePouleDto } from './dto/update-poule.dto';
import { UpdateUsuarioDto } from '../usuarios/dto/update-usuario.dto';
import { changeEstadoDto } from './dto/change-estado.dto';
import { EstadisticasModule } from '../estadisticas/estadisticas.module';
import { EstadisticasService } from '../estadisticas/estadisticas.service';

const httpMocks = require('node-mocks-http');

describe('PoulesService', () => {
  jest.setTimeout(20000)
  let service: PoulesService;
  let uSer: UsuarioService;
  let estadistica: EstadisticasService;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        MongooseModule.forRoot("mongodb+srv://Admin:LuubStar1@mainserver.r4fjvrb.mongodb.net/Tests"),
        MongooseModule.forFeature([{ name: Poule.name, schema: PouleSchema }]), 
        UsuarioModule,EstadisticasModule],
      controllers: [PoulesController],
      providers: [PoulesService, PoulesController],
      exports: [PoulesService]
    }).compile();
    service = module.get<PoulesService>(PoulesService);
    uSer = module.get<UsuarioService>(UsuarioService);
    estadistica = module.get<EstadisticasService>(EstadisticasService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  let createPoule;


  let Adoc = new CreatePouleDto()
  Adoc["Nombre"] = "A";
  Adoc["Valores"] = [5,5,3,3,1,1];
  Adoc["Tiradores"] = ["A","B","C"]
  let Bdoc = new CreatePouleDto()
  Bdoc["Nombre"] = "B";
  Bdoc["Valores"] = [5,5,3,3,1,1];

  let Cdoc = new CreatePouleDto();
  Cdoc["Nombre"] = "C";
  Cdoc["Valores"] = [5,5,3,3,1,1];

  let wD = new changePouleVencedores();
  wD["Vencedores"] = ["A"];

  let vD = new changeValoresDto();
  vD["Valores"] = [4,4,3,3,1,1];

  describe("Funciones", () => {
    beforeAll(async () => {
      service.getModel().deleteMany({});
      uSer.getModel().deleteMany({});
      estadistica.getModel().deleteMany({});
      createPoule = (await service.create(Adoc));
    });
  
    afterAll(async () => {
      let req = httpMocks.createRequest();
      await service.remove(createPoule["_id"]);
      expect((await service.findAll(req)).length).toBe(0);
      service.getModel().deleteMany({});
      uSer.getModel().deleteMany({});
      estadistica.getModel().deleteMany({});
    });

    it ("should create", () => {
      expect(createPoule).toBeDefined();
    })

    it("should update", async() => {
      expect((await service.update(createPoule["_id"], Bdoc))["Nombre"].toString()).toBe("B");
      expect((await service.update(createPoule["_id"], Adoc))["Nombre"].toString()).toBe("A");
    });

    it("should get values", async() => {
      expect((await service.getValores(createPoule["_id"] ))["Valores"].length).toBe(createPoule["Valores"].length);
    });

    it("should set state", async() => {
      let res = httpMocks.createResponse();
      let estado = new changeEstadoDto();
      estado["Estado"] = 1;
      await service.setEstado(createPoule["_id"], estado, res);
      expect(res.statusCode).toBe(HttpStatus.OK);

      res = httpMocks.createResponse();
      estado["Estado"] = 2;
      await service.setEstado(createPoule["_id"], estado, res);
      expect(res.statusCode).toBe(HttpStatus.OK);

      let req = httpMocks.createRequest()
      expect((await estadistica.findAll(req)).length).toBe(3);


      let testpoule = (await service.create(Bdoc));
      res = httpMocks.createResponse();
      estado["Estado"] = 0;
      service.setEstado(testpoule["_id"], estado, res);
      expect(res.statusCode).toBe(HttpStatus.OK);
      await service.remove(testpoule["_id"]);
    });

    it("should get dif", async() => {
      let res = httpMocks.createResponse();
      await service.dif([1,2], [1,2], res)
      expect(res.statusCode).toBe(HttpStatus.OK);


      res = httpMocks.createResponse();
      await service.dif([1,2], [1], res)
      expect(res.statusCode).toBe(HttpStatus.BAD_REQUEST);
    });

    it("should set values", async() =>{
      let Cp = await service.create(Cdoc);

      let res = httpMocks.createResponse();
      let Udoc = new CreateUsuarioDto();
      Udoc["Correo"] = "A";
      Udoc["Clave"] = "A";
      let U = await uSer.create(Udoc);  
      U = await uSer.activarUsuario(U["_id"]);
      await service.setValores(createPoule["_id"], U["Correo"], U["Clave"], vD, res);
      expect(res.statusCode).toBe(HttpStatus.UNAUTHORIZED);

      res = httpMocks.createResponse(); 
      let UdocU = new UpdateUsuarioDto();
      UdocU["Nivel"] = "Admin"
      U = await uSer.update(U["_id"],UdocU );
      await service.setValores(createPoule["_id"], U["Correo"], U["Clave"], vD, res);
      expect(res.statusCode).toBe(HttpStatus.OK);

      /*res = httpMocks.createResponse(); 
      UdocU["Nivel"] = "Tirador"
      UdocU["Poules"] = [createPoule["_id"]];
      U = await uSer.update(U["_id"],UdocU );
      let p = new UpdatePouleDto()
      p.Creador = U["_id"];
      createPoule = await service.update(createPoule["_id"], p);
      await service.setValores(createPoule["_id"], U["Correo"], U["Clave"], vD, res);
      expect(res.statusCode).toBe(HttpStatus.OK);

      res = httpMocks.createResponse(); 
      vD["Valores"] = [6,6];
      await service.setValores(createPoule["_id"], U["Correo"], U["Clave"], vD, res);
      
      expect(res.statusCode).toBe(HttpStatus.UNAUTHORIZED);*/

      await uSer.remove(U["_id"]);
      await service.remove(Cp["_id"]);
    })

    describe("Buscar", () => {
      it("should find all", async() => {
        let req = httpMocks.createRequest();
        expect((await service.findAll(req)).length).toBeGreaterThan(0);
      });
        it("should find one", async() => {
        expect((await service.findOne(createPoule["_id"]))["_id"].toString()).toBe(createPoule["_id"].toString());
      });

  
    });
  })
});
