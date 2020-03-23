import { User } from './user.entity';
import { UserRepository } from './user.repository';
import {
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as bcrypt from 'bcryptjs';

const mockCredentialsDTO = { username: 'test-user', password: 'test-password' };

describe('UserRepository', () => {
  let userRepository: UserRepository;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [UserRepository],
    }).compile();

    userRepository = await module.get<UserRepository>(UserRepository);
  });

  describe('signUp', () => {
    let save;
    beforeEach(() => {
      save = jest.fn();
      userRepository.create = jest.fn().mockReturnValue({ save });
    });

    it('Successfully signs up user.', async () => {
      save.mockResolvedValue(undefined);
      expect(userRepository.signUp(mockCredentialsDTO)).resolves.not.toThrow();
    });

    it('Throws conflict exception that user already exists.', async () => {
      save.mockRejectedValue({ code: '23505' });
      expect(userRepository.signUp(mockCredentialsDTO)).rejects.toThrow(
        ConflictException
      );
    });

    it('Throws internal server error.', async () => {
      save.mockRejectedValue({ code: '123' }); // Unhandled error code.
      expect(userRepository.signUp(mockCredentialsDTO)).rejects.toThrow(
        InternalServerErrorException
      );
    });
  });

  describe('validateUserPassword', () => {
    let user;
    beforeEach(() => {
      user = new User();
      user.username = 'test-user';
      user.password = jest.fn();
    });
    it('Returns user as validation is successful.', async () => {
      userRepository.findOne = jest.fn().mockResolvedValue(user);
      user.validatePassword = jest.fn().mockResolvedValue(true);

      const result = await userRepository.validateUserPassword(
        mockCredentialsDTO
      );
      expect(result).toEqual('test-user');
    });

    it('Returns null as user not found.', async () => {
      userRepository.findOne = jest.fn().mockResolvedValue(null);
      user.validatePassword = jest.fn().mockResolvedValue(true);
      const result = await userRepository.validateUserPassword(
        mockCredentialsDTO
      );
      expect(user.validatePassword).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });

    it('Returns null as password is invalid.', async () => {
      userRepository.findOne = jest.fn().mockResolvedValue(user);
      user.validatePassword = jest.fn().mockResolvedValue(false);
      const result = await userRepository.validateUserPassword(
        mockCredentialsDTO
      );
      expect(user.validatePassword).toHaveBeenCalled();
      expect(result).toBeNull();
    });
  });

  describe('hashPassword', () => {
    it('Calls bcrypt to generate a hash.', async () => {
      bcrypt.hash = jest.fn().mockResolvedValue('test-hash');
      expect(bcrypt.hash).not.toHaveBeenCalled();
      const result = await userRepository.hashPassword(
        'test-password',
        'test-hash'
      );
      expect(bcrypt.hash).toHaveBeenCalledWith('test-password', 'test-hash');
      expect(result).toEqual('test-hash');
    });
  });
});
