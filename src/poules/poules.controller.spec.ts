import { Test, TestingModule } from '@nestjs/testing';
import { PoulesController } from './poules.controller';
import { PoulesService } from './poules.service';

describe('PoulesController', () => {
  let controller: PoulesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PoulesController],
      providers: [PoulesService],
    }).compile();

    controller = module.get<PoulesController>(PoulesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
