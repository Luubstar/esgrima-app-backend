import { Test, TestingModule } from '@nestjs/testing';
import { SalaService } from './sala.service';
import { MongooseModule } from '@nestjs/mongoose';
import { SalaController } from './sala.controller';
import { Sala, SalaSchema } from './schemas/sala.schema';
import { UsuarioModule } from '../usuarios/usuario.module';
import { CreateSalaDto } from './dto/create-sala.dto';
const httpMocks = require('node-mocks-http');

describe('SalaService', () => {
  jest.setTimeout(20000)
  let service: SalaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [MongooseModule.forRoot("mongodb+srv://Admin:LuubStar1@mainserver.r4fjvrb.mongodb.net/Tests"),       
        MongooseModule.forFeature([{ name: Sala.name, schema: SalaSchema }]), UsuarioModule],
      controllers: [SalaController],
      providers: [SalaService],
    }).compile();
    
    service = module.get<SalaService>(SalaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  let createdSala;
  let Adoc = new CreateSalaDto();
  Adoc["Nombre"] = "A";
  let Bdoc = new CreateSalaDto();
  Bdoc["Nombre"] = "B";
  describe("Basic sala actions", () => {

    beforeAll(async () => {
      createdSala = await service.create(Adoc);
    });
  
    afterAll(async () => {
      var req = httpMocks.createRequest();
      await service.remove(createdSala["_id"]);
      expect((await service.findAll(req)).length).toBe(0);
    });

    it("should create a new sala", () => {
      expect(createdSala).toBeDefined()
    });

    it("should update", async() => {
      expect((await service.update(createdSala["_id"], Bdoc))["Nombre"].toString()).toBe("B");
      expect((await service.update(createdSala["_id"], Adoc))["Nombre"].toString()).toBe("A");
    })

    it("should find all", async() => {
      var req = httpMocks.createRequest();
      expect((await service.findAll(req)).length).toBe(1);
    });

    it("should find one", async() => {
      expect((await service.findOne(createdSala["_id"]))["_id"].toString()).toBe(createdSala["_id"].toString());
    });

    it("should find one by Name", async() => {
      expect((await service.findOneByName(createdSala["Nombre"]))["_id"].toString()).toBe(createdSala["_id"].toString());
    })

  })
});
