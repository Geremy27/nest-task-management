import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const typeORMConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'germanpardogomez',
  password: 'postgres',
  database: 'task_management',
  entities: [__dirname + '/../**/*.entity.{js,ts}'],
  synchronize: true,
};
