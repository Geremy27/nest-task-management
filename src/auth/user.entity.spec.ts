import { User } from './user.entity';
import * as bcrypt from 'bcryptjs';

describe('UserEntity', () => {
  let user: User;

  beforeEach(() => {
    user = new User();
    user.password = 'test-password';
    user.password = 'test-salt';
  });

  describe('validatePassword', () => {
    it('Returns true as password is valid.', async () => {
      bcrypt.hash = jest.fn().mockResolvedValue(user.password);
      expect(bcrypt.hash).not.toHaveBeenCalled();
      const result = await user.validatePassword(user.password);
      expect(bcrypt.hash).toHaveBeenCalledWith(user.password, user.salt);
      expect(result).toEqual(true);
    });
    it('Returns false as password is invalid.', async () => {
      bcrypt.hash = jest.fn().mockResolvedValue('wrong-password');
      expect(bcrypt.hash).not.toHaveBeenCalled();
      const result = await user.validatePassword('wrong-password');
      expect(bcrypt.hash).toHaveBeenCalledWith('wrong-password', user.salt);
      expect(result).toEqual(false);
    });
  });
});
