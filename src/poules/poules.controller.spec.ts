import { Test, TestingModule } from '@nestjs/testing';
import { PoulesController } from './poules.controller';
import { PoulesService } from './poules.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Poule, PouleSchema } from './schemas/poule.schema';
import { PoulesModule } from './poules.module';
import { UsuarioModule } from '../usuarios/usuario.module';
import { HttpStatus } from '@nestjs/common';
import { UsuarioService } from '../usuarios/usuario.service';
import { CreatePouleDto } from './dto/create-poule.dto';
import { UpdatePouleDto } from './dto/update-poule.dto';
import { changeEstadoDto } from './dto/change-estado.dto';
import { changeValoresDto } from './dto/change-valores.dto';
const httpMocks = require('node-mocks-http');

describe('PoulesController', () => {
  let controller: PoulesController;
  let service : PoulesService;
  let uSer: UsuarioService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        MongooseModule.forRoot("mongodb+srv://Admin:LuubStar1@mainserver.r4fjvrb.mongodb.net/Tests"),
        MongooseModule.forFeature([{ name: Poule.name, schema: PouleSchema }]), 
        UsuarioModule],
      controllers: [PoulesController],
      providers: [PoulesService, PoulesController],
      exports: [PoulesService]
    }).compile();

    controller = module.get<PoulesController>(PoulesController);
    service = module.get<PoulesService>(PoulesService);
    uSer = module.get<UsuarioService>(UsuarioService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it ("should create one", async () => {
    var res = httpMocks.createResponse();
    jest.spyOn(uSer,'checkIfAuth').mockResolvedValue(false); 
    await controller.create(new CreatePouleDto(), "a", "d", res);
    expect(res.statusCode).toBe(HttpStatus.UNAUTHORIZED)
    
    res = httpMocks.createResponse();
    jest.spyOn(service,'create').mockResolvedValue(new Poule()); 
    jest.spyOn(uSer,'checkIfAuth').mockResolvedValue(true); 
    await controller.create(new CreatePouleDto(), "a", "d", res);
    expect(res.statusCode).toBe(HttpStatus.ACCEPTED)
  })

  it ("should update one", async () => {
    var res = httpMocks.createResponse();
    jest.spyOn(uSer,'checkIfAdmin').mockResolvedValue(false); 
    await controller.update("", "a", "d", res, new UpdatePouleDto());
    expect(res.statusCode).toBe(HttpStatus.UNAUTHORIZED)
    
    res = httpMocks.createResponse();
    jest.spyOn(service,'update').mockResolvedValue(new Poule()); 
    jest.spyOn(uSer,'checkIfAdmin').mockResolvedValue(true); 
    await controller.update("", "a", "d", res,new UpdatePouleDto());
    expect(res.statusCode).toBe(HttpStatus.ACCEPTED)
  })

  it ("should change state", async () => {
    var res = httpMocks.createResponse();
    jest.spyOn(service,'findOne').mockResolvedValue(new Poule()); 
    jest.spyOn(uSer,'checkIfAuth').mockResolvedValue(false);
    jest.spyOn(uSer,'checkIfAdmin').mockResolvedValue(false); 
    await controller.changePouleEstado("aaaa", "a", "d", "", new changeEstadoDto(), res);
    expect(res.statusCode).toBe(HttpStatus.UNAUTHORIZED)
    
    res = httpMocks.createResponse();
    jest.spyOn(service,'setEstado').mockResolvedValue(new Poule()); 
    jest.spyOn(uSer,'checkIfAdmin').mockResolvedValue(true); 
    await controller.changePouleEstado("", "a", "d", "", new changeEstadoDto(), res);
    expect(res.statusCode).toBe(HttpStatus.OK)
  })

  it ("should change poule values", async () => {
    var res = httpMocks.createResponse();
    jest.spyOn(uSer,'checkIfAuth').mockResolvedValue(false); 
    await controller.changePoulevalores("", "a", "d", new changeValoresDto(), res);
    expect(res.statusCode).toBe(HttpStatus.UNAUTHORIZED)
    
    res = httpMocks.createResponse();
    jest.spyOn(service,'setValores').mockResolvedValue(new Poule()[1]); 
    jest.spyOn(uSer,'checkIfAuth').mockResolvedValue(true); 
    await controller.changePoulevalores("", "a", "d", new changeValoresDto(), res);
    expect(res.statusCode).toBe(HttpStatus.OK)
  })

  it ("should get poule values", async () => {
    var res = httpMocks.createResponse();
    jest.spyOn(uSer,'checkIfAuth').mockResolvedValue(false); 
    await controller.getPoulevalores("", "a", "d", res);
    expect(res.statusCode).toBe(HttpStatus.UNAUTHORIZED)
    
    res = httpMocks.createResponse();
    jest.spyOn(service,'getValores').mockResolvedValue(new Poule()); 
    jest.spyOn(uSer,'checkIfAuth').mockResolvedValue(true); 
    await controller.getPoulevalores("", "a", "d", res);
    expect(res.statusCode).toBe(HttpStatus.OK)
  })

  describe("Find actions", () =>{
    it ("should find all", async () => {
      var res = httpMocks.createResponse();
      var req = httpMocks.createRequest();
      jest.spyOn(uSer,'checkIfAuth').mockResolvedValue(false); 
      await controller.findAll(req, "", "", res);
      expect(res.statusCode).toBe(HttpStatus.UNAUTHORIZED)
      
      res = httpMocks.createResponse();
      jest.spyOn(service,'findAll').mockResolvedValue(new Poule()[1]); 
      jest.spyOn(uSer,'checkIfAuth').mockResolvedValue(true); 
      await controller.findAll(req, "", "", res); 
      expect(res.statusCode).toBe(HttpStatus.OK)
    })

    it ("should find one by id", async () => {
      var res = httpMocks.createResponse();
      jest.spyOn(service,'findOne').mockResolvedValue(new Poule()); 

      await controller.findOne("", res);
      expect(res.statusCode).toBe(HttpStatus.OK);
    })
  })
});
