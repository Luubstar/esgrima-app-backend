import { Test, TestingModule } from '@nestjs/testing';
import { UsuarioService } from './usuario.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UsuarioController } from './usuario.controller';
import { Usuario, UsuarioSchema } from './schemas/usuario.schema';
import { PoulesModule } from '../poules/poules.module';
import { HttpStatus } from '@nestjs/common';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { CreatePouleDto } from '../poules/dto/create-poule.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { PoulesService } from '../poules/poules.service';
const httpMocks = require('node-mocks-http');

describe('UsuarioService',  () => {
  
  let service: UsuarioService;
  let pservice : PoulesService;

  beforeAll(async () => {
    jest.setTimeout(20000)
    const module: TestingModule = await Test.createTestingModule({
      imports: [MongooseModule.forRoot("mongodb+srv://Admin:LuubStar1@mainserver.r4fjvrb.mongodb.net/Tests"),       
      MongooseModule.forFeature([{ name: Usuario.name, schema: UsuarioSchema}]), PoulesModule],
      controllers: [UsuarioController],
      providers: [UsuarioService, UsuarioController],
    }).compile();
    
    service = module.get<UsuarioService>(UsuarioService);
    pservice = module.get<PoulesService>(PoulesService);

  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  
  describe("User actions", () => {

    let Adoc = new CreateUsuarioDto();
    Adoc.Nombre = "A";
    Adoc.Correo = "A";
    Adoc.Clave = "A";

    let Bdoc = new UpdateUsuarioDto();
    Bdoc.Nombre = "B";
    Bdoc.Correo = "B";
    Bdoc.Clave = "B";
    let createdUser: Usuario;

    beforeAll(async () => {
      await service.getModel().deleteMany({});
      await pservice.getModel().deleteMany({});
      createdUser = await service.create(Adoc);
    });
  
    afterAll(async () => {
      await service.remove(createdUser["_id"]);
      expect((await service.findAll()).length).toBe(0);
      createdUser = await service.create(Adoc);
      await service.removebyMail(createdUser["Correo"]);
      expect((await service.findAll()).length).toBe(0);
      service.getModel().deleteMany({});
      pservice.getModel().deleteMany({});
    });
  
    it('should create users', async () => {
      expect(createdUser).toBeDefined();
    });

    it("should find the user",async () => {
      let req = httpMocks.createRequest();
      expect(createdUser).toBeDefined();
      expect((await service.findAll()).length).toBe(0);
      expect((await service.findAllbtn(req)).length).toBe(1);
      expect((await service.findByMail(createdUser["Correo"]))).toBeInstanceOf(Object);
      expect((await service.findById(createdUser["_id"]))).toBeInstanceOf(Object);
      expect((await service.findByName(createdUser["Nombre"]))).toBeInstanceOf(Object);
      expect((await service.findBySala(createdUser["Sala"])).length).toBe(1);
    })


    it ("should fail all the checks", async () => {
      let res = httpMocks.createResponse();
      await service.GetIfLoged("Z","Z", res);
      expect(res.statusCode).toBe(HttpStatus.UNAUTHORIZED)

      expect((await service.checkIfAuth(createdUser["Correo"], createdUser["Clave"]))).toBe(false);
      expect((await service.checkIfExists("Z", "Z"))).toBe(false);
      expect((await service.findNivel(createdUser["Correo"], createdUser["Clave"]))).toBeNull();
    });

    it ("should find as unactive", async () => {
      
      expect((await service.findActivado(createdUser["Correo"], createdUser["Clave"]))).toBe(false);
      expect((await service.findAllUnactive()).length).toBe(1);
      await service.actiletUsuario(createdUser["_id"]);
      expect((await service.findActivado(createdUser["Correo"], createdUser["Clave"]))).toBe(true);
      expect((await service.checkIfAuth(createdUser["Correo"], createdUser["Clave"]))).toBe(true);
    })
  
    it ("should check the user values and activation", async () => {
      let res = httpMocks.createResponse();
      expect((await service.checkIfExists(createdUser["Correo"], createdUser["Clave"]))).toBe(true);
      expect((await service.checkIfAdmin(createdUser["Correo"], createdUser["Clave"]))).toBe(false);
      expect((await service.GetIfLoged(createdUser["Correo"], createdUser["Clave"], res))).toBe(createdUser["_id"].toString());
      expect((await service.findNivel(createdUser["Correo"], createdUser["Clave"]))).toBe(createdUser["Nivel"]);
    })


    it ("should add and remove a poule", async () => {
      let pdoc = new CreatePouleDto()
      let poule = await pservice.create(pdoc);
      createdUser = (await service.addPoule(createdUser["_id"], poule["_id"]))
      expect(createdUser["Poules"].length).toBe(1);
      createdUser =  (await service.removePoule(createdUser["_id"], poule["_id"]));
      expect(createdUser["Poules"].length).toBe(0);
      await pservice.remove(poule["_id"]);
      })

    it ("should update A to B",async () =>{
      createdUser = await service.update(createdUser["_id"], Bdoc)
      expect(createdUser["Nombre"]).toBe(Bdoc["Nombre"]);
    });
  });
  });
