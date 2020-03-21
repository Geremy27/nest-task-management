import { User } from './../auth/user.entity';
import { GetTasksFilterDTO } from './dto/get-tasks-filter.dto';
import { Repository, EntityRepository } from 'typeorm';
import { CreateTaskDTO } from './dto/create-task.dto';
import { Task } from './task.entity';
import { TaskStatus } from './task-status.enum';

@EntityRepository(Task)
export class TaskRepository extends Repository<Task> {
  async getTasks(
    { search, status }: GetTasksFilterDTO,
    user: User
  ): Promise<Task[]> {
    const query = this.createQueryBuilder('task');

    query.where('task.userId = :userId', { userId: user.id });

    if (status) {
      query.andWhere('task.status = :status', { status });
    }

    if (search) {
      query.andWhere(
        'task.title LIKE :search OR task.description LIKE :search',
        { search: `%${search}%` }
      );
    }
    const tasks = await query.getMany();

    return tasks;
  }

  async createTask(
    { title, description }: CreateTaskDTO,
    user: User
  ): Promise<Task> {
    const task = new Task();
    task.title = title;
    task.description = description;
    task.status = TaskStatus.OPEN;
    task.user = user;
    await task.save();

    delete task.user;

    return task;
  }
}
