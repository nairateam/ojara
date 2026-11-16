import { Test } from '@nestjs/testing';
import { describe, expect, it } from 'vitest';
import { AppConfigService } from '../config/app-config.service.js';
import { PrismaService } from '../database/prisma.service.js';
import { IMAGE_SERVICE } from '../media/image.service.js';
import { CatalogController } from './catalog.controller.js';
import { CatalogService } from './catalog.service.js';

describe('CatalogModule', () => {
  it('wires controller and service', async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [CatalogController],
      providers: [
        CatalogService,
        { provide: PrismaService, useValue: {} },
        { provide: AppConfigService, useValue: { env: {} } },
        { provide: IMAGE_SERVICE, useValue: {} },
      ],
    }).compile();
    expect(moduleRef.get(CatalogController)).toBeDefined();
    expect(moduleRef.get(CatalogService)).toBeDefined();
  });
});
