import { Test, TestingModule } from '@nestjs/testing';
import { SalaController } from './sala.controller';
import { SalaService } from './sala.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Sala, SalaSchema } from './schemas/sala.schema';
import { UsuarioModule } from '../usuarios/usuario.module';
import { UsuarioService } from '../usuarios/usuario.service';
import { CreateSalaDto } from './dto/create-sala.dto';
import { HttpStatus } from '@nestjs/common';
const httpMocks = require('node-mocks-http');

describe('SalaController', () => {
  let controller: SalaController;
  let service : SalaService;
  let uService : UsuarioService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [MongooseModule.forRoot("mongodb+srv://Admin:LuubStar1@mainserver.r4fjvrb.mongodb.net/Tests"),       
        MongooseModule.forFeature([{ name: Sala.name, schema: SalaSchema }]), UsuarioModule],
      controllers: [SalaController],
      providers: [SalaService],
    }).compile();

    controller = module.get<SalaController>(SalaController);
    service = module.get<SalaService>(SalaService);
    uService = controller.usuario;
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe("Pruebas del controlador", () => {
    it ("should create a new sala", async () => {
      var res = httpMocks.createResponse();
      jest.spyOn(uService,'checkIfAdmin').mockResolvedValue(false); 
      await controller.create("a", "b", new CreateSalaDto(), res);
      expect(res.statusCode).toBe(HttpStatus.UNAUTHORIZED)
      
      res = httpMocks.createResponse();
      jest.spyOn(service,'create').mockResolvedValue(new Sala()); 
      jest.spyOn(uService,'checkIfAdmin').mockResolvedValue(true); 
      await controller.create("a", "b",  new CreateSalaDto(), res);
      expect(res.statusCode).toBe(HttpStatus.ACCEPTED);
    });

    it ("should update the sala", async () => {
      var res = httpMocks.createResponse();
      jest.spyOn(uService,'checkIfAdmin').mockResolvedValue(false); 
      await controller.update("a", "b", "", new CreateSalaDto(), res);
      expect(res.statusCode).toBe(HttpStatus.UNAUTHORIZED)
      
      res = httpMocks.createResponse();
      jest.spyOn(service,'update').mockResolvedValue(new Sala()); 
      jest.spyOn(uService,'checkIfAdmin').mockResolvedValue(true); 
      await controller.update("a", "b", "", new CreateSalaDto(), res);
      expect(res.statusCode).toBe(HttpStatus.ACCEPTED);
    });

    it ("should remove the sala", async () => {
      var res = httpMocks.createResponse();
      jest.spyOn(uService,'checkIfAdmin').mockResolvedValue(false); 
      await controller.remove("a", "b", "", res);
      expect(res.statusCode).toBe(HttpStatus.UNAUTHORIZED)
      
      res = httpMocks.createResponse();
      jest.spyOn(service,'remove').mockResolvedValue(new Sala()); 
      jest.spyOn(uService,'checkIfAdmin').mockResolvedValue(true); 
      await controller.remove("a", "b", "", res);
      expect(res.statusCode).toBe(HttpStatus.OK);
    });
    
    describe("Finding", () => {
      it("should find all", async () => {
        var res = httpMocks.createResponse();
        var req = httpMocks.createRequest();
        jest.spyOn(service,'findAll').mockResolvedValue(new Sala()[1]); 

        await controller.findAll(req,res);
        expect(res.statusCode).toBe(HttpStatus.OK);
      })

      it("should find one", async () => {
        var res = httpMocks.createResponse();
        var req = httpMocks.createRequest();
        jest.spyOn(service,'findOne').mockResolvedValue(new Sala()); 

        await controller.findOne(req,res);
        expect(res.statusCode).toBe(HttpStatus.OK);
      })

      it("should find one by name", async () => {
        var res = httpMocks.createResponse();
        jest.spyOn(service,'findOneByName').mockResolvedValue(new Sala()); 

        await controller.findOneByName("",res);
        expect(res.statusCode).toBe(HttpStatus.OK);
      })
    })
  })
});
