import { UnauthorizedException } from '@nestjs/common';
import { User } from './user.entity';
import { Test } from '@nestjs/testing';
import { UserRepository } from './user.repository';
import { JwtStrategy } from './jwt.strategy';

const mockUserRepository = () => ({
  findOne: jest.fn(),
});

describe('JwtStrategy', () => {
  let jwtStrategy: JwtStrategy;
  let userRepository;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        { provide: UserRepository, useFactory: mockUserRepository },
      ],
    }).compile();

    jwtStrategy = await module.get<JwtStrategy>(JwtStrategy);
    userRepository = await module.get<UserRepository>(UserRepository);
  });

  describe('Validate', () => {
    it('Validates and returns based on the JWT payload.', async () => {
      const user = new User();
      user.username = 'test-user';

      userRepository.findOne = jest.fn().mockResolvedValue(user);
      const result = await jwtStrategy.validate({ username: user.username });
      expect(userRepository.findOne).toHaveBeenCalledWith({
        username: user.username,
      });
      expect(result).toEqual(user);
    });
    it('Throws an unauthorized execption as user cannot be found.', () => {
      userRepository.findOne = jest.fn().mockResolvedValue(null);
      expect(jwtStrategy.validate({ username: 'test-user' })).rejects.toThrow(
        UnauthorizedException
      );
    });
  });
});
