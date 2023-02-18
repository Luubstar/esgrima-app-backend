import { Test, TestingModule } from '@nestjs/testing';
import { PoulesService } from './poules.service';

describe('PoulesService', () => {
  let service: PoulesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PoulesService],
    }).compile();

    service = module.get<PoulesService>(PoulesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
