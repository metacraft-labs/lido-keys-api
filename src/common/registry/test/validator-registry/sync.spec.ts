import { MikroOrmModule } from '@mikro-orm/nestjs';
import { nullTransport, LoggerModule } from '@lido-nestjs/logger';
import { ModuleMetadata } from '@nestjs/common';
import { getNetwork } from '@ethersproject/networks';
import { getDefaultProvider, Provider } from '@ethersproject/providers';
import { Test } from '@nestjs/testing';
import { ValidatorRegistryModule, ValidatorRegistryService, RegistryStorageService } from '../../';
import { MikroORM } from '@mikro-orm/core';
import { mikroORMConfig } from '../testing.utils';

describe('Sync module initializing', () => {
  const provider = getDefaultProvider('mainnet');

  jest.spyOn(provider, 'detectNetwork').mockImplementation(async () => getNetwork('mainnet'));

  const testModules = async (metadata: ModuleMetadata) => {
    const moduleRef = await Test.createTestingModule(metadata).compile();
    const registryService: ValidatorRegistryService = moduleRef.get(ValidatorRegistryService);
    const storageService = moduleRef.get(RegistryStorageService);

    const generator = moduleRef.get(MikroORM).getSchemaGenerator();
    await generator.updateSchema();

    expect(registryService).toBeDefined();
    await storageService.onModuleDestroy();
  };

  test('forRoot', async () => {
    const imports = [
      MikroOrmModule.forRoot(mikroORMConfig),
      LoggerModule.forRoot({ transports: [nullTransport()] }),
      ValidatorRegistryModule.forRoot({
        provider,
      }),
    ];
    await testModules({ imports });
  });

  test('forFeature', async () => {
    const imports = [
      MikroOrmModule.forRoot(mikroORMConfig),
      LoggerModule.forRoot({ transports: [nullTransport()] }),
      ValidatorRegistryModule.forFeature({
        provider,
      }),
    ];
    await testModules({ imports });
  });

  test('forFeature + global provider', async () => {
    const imports = [
      MikroOrmModule.forRoot(mikroORMConfig),
      LoggerModule.forRoot({ transports: [nullTransport()] }),
      ValidatorRegistryModule.forFeature(),
    ];

    const metadata = {
      imports,
      providers: [{ provide: Provider, useValue: provider }],
    };

    await testModules(metadata);
  });
});
