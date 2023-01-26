/* eslint-disable @typescript-eslint/no-unused-vars */
import { Test } from '@nestjs/testing';
import { KeysController, KeysService } from '../../src/http/keys';
import { hexZeroPad } from '@ethersproject/bytes';
import { RegistryService } from '../../src/jobs/registry.service';
import { LOGGER_PROVIDER } from '@lido-nestjs/logger';
import { ConfigService } from '../../src/common/config';

import {
  communityKeys,
  generalKeys,
  comminityKeysWithAddressMainnet,
  comminityKeysWithAddressGoerli,
  communityModuleMainnet,
  communityModuleGoerli,
  elMeta,
  elBlockSnapshot,
} from '../fixtures';

describe('Keys controller', () => {
  let keysController: KeysController;
  let registryService: RegistryService;

  // const OLD_ENV = process.env;

  class ConfigServiceMock {
    get(value) {
      return process.env[value];
    }
  }

  class RegistryServiceMock {
    getKeysWithMeta(filters) {
      return Promise.resolve({ keys: communityKeys, meta: elMeta });
    }
    getKeyWithMetaByPubkey(pubkey: string) {
      return Promise.resolve({ keys: communityKeys, meta: elMeta });
    }

    getKeysWithMetaByPubkeys(pubkeys: string[]) {
      return Promise.resolve({ keys: communityKeys, meta: elMeta });
    }
  }

  const OLD_ENV = process.env;

  beforeEach(async () => {
    jest.resetModules();
    process.env = { ...OLD_ENV };

    const moduleRef = await Test.createTestingModule({
      controllers: [KeysController],
      providers: [
        KeysService,
        {
          provide: RegistryService,
          useClass: RegistryServiceMock,
        },
        {
          provide: ConfigService,
          useClass: ConfigServiceMock,
        },
        {
          provide: LOGGER_PROVIDER,
          useFactory: () => ({
            log: jest.fn(),
          }),
        },
      ],
    }).compile();
    keysController = moduleRef.get<KeysController>(KeysController);
    registryService = moduleRef.get<RegistryService>(RegistryService);
  });

  afterAll(() => {
    process.env = OLD_ENV;
  });

  describe('get', () => {
    test('keys on Mainnet', async () => {
      process.env['CHAIN_ID'] = '1';

      const getKeysWithMetaMock = jest.spyOn(registryService, 'getKeysWithMeta');

      const result = await keysController.get({ used: true, operatorIndex: 1 });

      expect(getKeysWithMetaMock).toBeCalledTimes(1);
      expect(getKeysWithMetaMock).toBeCalledWith({ used: true, operatorIndex: 1 });

      expect(result).toEqual({
        data: comminityKeysWithAddressMainnet,
        meta: {
          elBlockSnapshot,
        },
      });
    });

    test('keys on Goerli', async () => {
      process.env['CHAIN_ID'] = '5';

      const getKeysWithMetaMock = jest.spyOn(registryService, 'getKeysWithMeta');

      const result = await keysController.get({ used: true, operatorIndex: 1 });

      expect(getKeysWithMetaMock).toBeCalledTimes(1);
      expect(getKeysWithMetaMock).toBeCalledWith({ used: true, operatorIndex: 1 });

      expect(result).toEqual({
        data: comminityKeysWithAddressGoerli,
        meta: {
          elBlockSnapshot,
        },
      });
    });

    test('EL meta is empty', async () => {
      process.env['CHAIN_ID'] = '1';

      const getKeysWithMetaMock = jest
        .spyOn(registryService, 'getKeysWithMeta')
        .mockImplementation(() => Promise.resolve({ keys: [], meta: null }));

      const result = await keysController.get({ used: true, operatorIndex: 1 });

      expect(result).toEqual({ data: [], meta: null });

      expect(getKeysWithMetaMock).toBeCalledTimes(1);
      expect(getKeysWithMetaMock).toBeCalledWith({ used: true, operatorIndex: 1 });
    });
  });

  describe('getByPubkey', () => {
    test('keys on Mainnet', async () => {
      process.env['CHAIN_ID'] = '1';

      const getKeyWithMetaByPubkeyMock = jest.spyOn(registryService, 'getKeyWithMetaByPubkey');

      const result = await keysController.getByPubkey(hexZeroPad('0x13', 98));

      expect(getKeyWithMetaByPubkeyMock).toBeCalledTimes(1);
      expect(getKeyWithMetaByPubkeyMock).toBeCalledWith(hexZeroPad('0x13', 98));

      expect(result).toEqual({
        data: comminityKeysWithAddressMainnet,
        meta: {
          elBlockSnapshot,
        },
      });
    });

    test('keys on Goerli', async () => {
      process.env['CHAIN_ID'] = '5';

      const getKeyWithMetaByPubkeyMock = jest.spyOn(registryService, 'getKeyWithMetaByPubkey');

      const result = await keysController.getByPubkey(hexZeroPad('0x13', 98));

      expect(getKeyWithMetaByPubkeyMock).toBeCalledTimes(1);
      expect(getKeyWithMetaByPubkeyMock).toBeCalledWith(hexZeroPad('0x13', 98));

      expect(result).toEqual({
        data: comminityKeysWithAddressGoerli,
        meta: {
          elBlockSnapshot,
        },
      });
    });

    test('EL meta is empty', async () => {
      process.env['CHAIN_ID'] = '1';

      const getKeyWithMetaByPubkeyMock = jest
        .spyOn(registryService, 'getKeyWithMetaByPubkey')
        .mockImplementation(() => Promise.resolve({ keys: [], meta: null }));

      const result = await keysController.getByPubkey(hexZeroPad('0x13', 98));

      expect(result).toEqual({ data: [], meta: null });

      expect(getKeyWithMetaByPubkeyMock).toBeCalledTimes(1);
      expect(getKeyWithMetaByPubkeyMock).toBeCalledWith(hexZeroPad('0x13', 98));
    });
  });

  describe('getByPubkeys', () => {
    test('keys on Mainnet', async () => {
      process.env['CHAIN_ID'] = '1';

      const getKeysWithMetaByPubkeysMock = jest.spyOn(registryService, 'getKeysWithMetaByPubkeys');

      const result = await keysController.getByPubkeys([hexZeroPad('0x13', 98), hexZeroPad('0x12', 98)]);

      expect(getKeysWithMetaByPubkeysMock).toBeCalledTimes(1);
      expect(getKeysWithMetaByPubkeysMock).toBeCalledWith([hexZeroPad('0x13', 98), hexZeroPad('0x12', 98)]);

      expect(result).toEqual({
        data: comminityKeysWithAddressMainnet,
        meta: {
          elBlockSnapshot,
        },
      });
    });

    test('keys on Goerli', async () => {
      process.env['CHAIN_ID'] = '5';

      const getKeysWithMetaByPubkeysMock = jest.spyOn(registryService, 'getKeysWithMetaByPubkeys');

      const result = await keysController.getByPubkeys([hexZeroPad('0x13', 98), hexZeroPad('0x12', 98)]);

      expect(getKeysWithMetaByPubkeysMock).toBeCalledTimes(1);
      expect(getKeysWithMetaByPubkeysMock).toBeCalledWith([hexZeroPad('0x13', 98), hexZeroPad('0x12', 98)]);

      expect(result).toEqual({
        data: comminityKeysWithAddressGoerli,
        meta: {
          elBlockSnapshot,
        },
      });
    });

    test('EL meta is empty', async () => {
      process.env['CHAIN_ID'] = '1';

      const getKeysWithMetaByPubkeysMock = jest
        .spyOn(registryService, 'getKeysWithMetaByPubkeys')
        .mockImplementation(() => Promise.resolve({ keys: [], meta: null }));

      const result = await keysController.getByPubkeys([hexZeroPad('0x13', 98), hexZeroPad('0x12', 98)]);

      expect(result).toEqual({ data: [], meta: null });

      expect(getKeysWithMetaByPubkeysMock).toBeCalledTimes(1);
      expect(getKeysWithMetaByPubkeysMock).toBeCalledWith([hexZeroPad('0x13', 98), hexZeroPad('0x12', 98)]);
    });
  });
});
