import { Test, TestingModule } from '@nestjs/testing';
import { UsuarioController } from './usuario.controller';
import { UsuarioService } from './usuario.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Usuario, UsuarioSchema } from './schemas/usuario.schema';
import { PoulesModule } from '../poules/poules.module';
import { HttpStatus } from '@nestjs/common';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
const httpMocks = require('node-mocks-http');

describe('UsuarioController', () => {
  let controller: UsuarioController;
  let service: UsuarioService;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [MongooseModule.forRoot("mongodb+srv://Admin:LuubStar1@mainserver.r4fjvrb.mongodb.net/Tests"),       
      MongooseModule.forFeature([{ name: Usuario.name, schema: UsuarioSchema}]), PoulesModule],
      controllers: [UsuarioController],
      providers: [UsuarioService, UsuarioController],
    }).compile();
    
    controller = module.get<UsuarioController>(UsuarioController);
    service = module.get<UsuarioService>(UsuarioService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe("Pruebas del controlador", () => {

    it ("should know if user is logged", async () => {
      var res = httpMocks.createResponse();
      let result = "";
      jest.spyOn(service,'GetIfLoged').mockResolvedValue(result); 
      await controller.checkIfLogged("a", "b", res);
      
      expect(res.statusCode).toBe(HttpStatus.UNAUTHORIZED)

      res = httpMocks.createResponse();
      result = "12345";
      jest.spyOn(service,'GetIfLoged').mockResolvedValue(result); 
      await controller.checkIfLogged("a", "b", res);
      expect(res.statusCode).toBe(HttpStatus.ACCEPTED)
    });

    it ("should return user level", async () => {
      var res = httpMocks.createResponse();
      let result = "tirador";
      jest.spyOn(service,'findNivel').mockResolvedValue(result); 

      await controller.findNivel("a", "b", res);
      expect(res.statusCode).toBe(HttpStatus.OK)
    })

    it ("should return activation confim", async () => {

      jest.spyOn(service,'activarUsuario').mockResolvedValue(new Usuario()); 
      expect((await controller.activarbyId("")).length).toBeGreaterThan(1);
    })

    it ("should send the activation email", async () => {

      let transporter = controller.getTransporter();
      let result = "";
      var res = httpMocks.createResponse();
      jest.spyOn(service,'create').mockResolvedValue(new Usuario()); 
      jest.spyOn(service,'remove').mockResolvedValue(new Usuario())

      jest.spyOn(transporter,'sendMail').mockResolvedValue(result); 
      await controller.create(new CreateUsuarioDto(), res);
      expect(res.statusCode).toBe(HttpStatus.ACCEPTED);

      res = httpMocks.createResponse();
      jest.spyOn(transporter,'sendMail').mockResolvedValue(null); 
      await controller.create(new CreateUsuarioDto(), res);
      expect(res.statusCode).toBe(HttpStatus.SERVICE_UNAVAILABLE);
      
    })

    it ("should update user", async () => {
      var res = httpMocks.createResponse();
      jest.spyOn(service,'checkIfAdmin').mockResolvedValue(false); 
      await controller.update("a", "b", "", new UpdateUsuarioDto(), res);
      expect(res.statusCode).toBe(HttpStatus.UNAUTHORIZED)
      
      res = httpMocks.createResponse();
      jest.spyOn(service,'update').mockResolvedValue(new Usuario()); 
      jest.spyOn(service,'checkIfAdmin').mockResolvedValue(true); 
      await controller.update("a", "b", "", new UpdateUsuarioDto(), res);
      expect(res.statusCode).toBe(HttpStatus.ACCEPTED)
    });

    it ("should delete user", async () => {
      var res = httpMocks.createResponse();
      jest.spyOn(service,'checkIfAdmin').mockResolvedValue(false); 
      await controller.remove("a", "b", "", res);
      expect(res.statusCode).toBe(HttpStatus.UNAUTHORIZED)
      
      res = httpMocks.createResponse();
      jest.spyOn(service,'remove').mockResolvedValue(new Usuario()); 
      jest.spyOn(service,'checkIfAdmin').mockResolvedValue(true); 
      await controller.remove("a", "b", "", res);
      expect(res.statusCode).toBe(HttpStatus.OK)
    });

    it ("should self-delete user by mail", async () => {
      var res = httpMocks.createResponse();
      jest.spyOn(service,'checkIfAuth').mockResolvedValue(false); 
      await controller.removebyMail("a", "d", res);
      expect(res.statusCode).toBe(HttpStatus.UNAUTHORIZED)
      
      res = httpMocks.createResponse();
      jest.spyOn(service,'removebyMail').mockResolvedValue(new Usuario()); 
      jest.spyOn(service,'checkIfAuth').mockResolvedValue(true); 
      await controller.removebyMail("a", "d", res);
      expect(res.statusCode).toBe(HttpStatus.OK)
    });

    it ("should add poule", async () => {
      var res = httpMocks.createResponse();
      jest.spyOn(service,'checkIfAuth').mockResolvedValue(false); 
      await controller.addPoule("a", "b", "c", "d", res);
      expect(res.statusCode).toBe(HttpStatus.UNAUTHORIZED)
      
      res = httpMocks.createResponse();
      jest.spyOn(service,'addPoule').mockResolvedValue(new Usuario()); 
      jest.spyOn(service,'checkIfAuth').mockResolvedValue(true); 
      await controller.addPoule("a", "b", "c", "d", res);
      expect(res.statusCode).toBe(HttpStatus.OK)
    });

    it ("should remove poule", async () => {
      var res = httpMocks.createResponse();
      jest.spyOn(service,'checkIfAuth').mockResolvedValue(false); 
      await controller.removePoule("a", "b", "c", "d", res);
      expect(res.statusCode).toBe(HttpStatus.UNAUTHORIZED)
      
      res = httpMocks.createResponse();
      jest.spyOn(service,'removePoule').mockResolvedValue(new Usuario()); 
      jest.spyOn(service,'checkIfAuth').mockResolvedValue(true); 
      await controller.removePoule("a", "b", "c", "d", res);
      expect(res.statusCode).toBe(HttpStatus.OK)
    });

    describe("Find actions", () =>{
      it ("should find all", async () => {
        var res = httpMocks.createResponse();
        jest.spyOn(service,'findAll').mockResolvedValue(new Usuario()[1]); 

        await controller.findAll(res);
        expect(res.statusCode).toBe(HttpStatus.OK);
      })

      it ("should find one by id", async () => {
        var res = httpMocks.createResponse();
        jest.spyOn(service,'findById').mockResolvedValue(new Usuario()); 

        await controller.findOnebyID("", res);
        expect(res.statusCode).toBe(HttpStatus.OK);
      })

      it ("should find one by mail", async () => {
        var res = httpMocks.createResponse();
        jest.spyOn(service,'findByMail').mockResolvedValue(new Usuario()); 

        await controller.findOneByMail("", res);
        expect(res.statusCode).toBe(HttpStatus.OK);
      })

      it ("should find all by name", async () => {
        var res = httpMocks.createResponse();
        jest.spyOn(service,'checkIfAuth').mockResolvedValue(false); 
        await controller.findAllWithName("a", "b", "c", res);
        expect(res.statusCode).toBe(HttpStatus.UNAUTHORIZED)
        
        res = httpMocks.createResponse();
        jest.spyOn(service,'findByName').mockResolvedValue(new Usuario()[1]); 
        jest.spyOn(service,'checkIfAuth').mockResolvedValue(true); 
        await controller.findAllWithName("a", "b", "c", res);
        expect(res.statusCode).toBe(HttpStatus.OK)
      })

      it ("should find one by sala", async () => {
        var res = httpMocks.createResponse();
        jest.spyOn(service,'findBySala').mockResolvedValue(new Usuario()[1]); 

        await controller.findOneBySala("", res);
        expect(res.statusCode).toBe(HttpStatus.OK);
      })

      it ("should find all as buttons", async () => {
        var res = httpMocks.createResponse();
        var req = httpMocks.createRequest();

        jest.spyOn(service,'findAllbtn').mockResolvedValue(new Usuario()[1]); 
        jest.spyOn(service,'checkIfAuth').mockResolvedValue(false); 
        await controller.findAllbotones(req, "a", "b", res);
        expect(res.statusCode).toBe(HttpStatus.UNAUTHORIZED);


        var res = httpMocks.createResponse();
        var req = httpMocks.createRequest();

        jest.spyOn(service,'checkIfAuth').mockResolvedValue(true); 
        await controller.findAllbotones(req, "a", "b", res);
        expect(res.statusCode).toBe(HttpStatus.OK);
      })
    });

  })
});
