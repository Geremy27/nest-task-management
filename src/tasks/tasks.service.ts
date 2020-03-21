import { User } from './../auth/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Task } from './task.entity';
import { TaskRepository } from './task.repository';
import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTaskDTO } from './dto/create-task.dto';
import { TaskStatus } from './task-status.enum';
import { GetTasksFilterDTO } from './dto/get-tasks-filter.dto';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(TaskRepository) private taskRepository: TaskRepository
  ) {}

  async getTasks(filterDTO: GetTasksFilterDTO, user: User): Promise<Task[]> {
    return this.taskRepository.getTasks(filterDTO, user);
  }

  async getTaskById(id: number, user: User): Promise<Task> {
    const foundTask = await this.taskRepository.findOne({
      where: { id, userId: user.id },
    });
    if (!foundTask) {
      throw new NotFoundException(`Task with ID '${id}' not found`);
    }

    return foundTask;
  }

  async createTask(createTaskDTO: CreateTaskDTO, user: User): Promise<Task> {
    return this.taskRepository.createTask(createTaskDTO, user);
  }

  async updateTaskStatus(
    id: number,
    newStatus: TaskStatus,
    user: User
  ): Promise<Task> {
    const taskToUpdate = await this.getTaskById(id, user);
    taskToUpdate.status = newStatus;
    taskToUpdate.save();

    return taskToUpdate;
  }

  async deleteTaskById(id: number, user: User): Promise<void> {
    const deleteResult = await this.taskRepository.delete({
      id,
      userId: user.id,
    });

    if (deleteResult.affected === 0) {
      throw new NotFoundException(`Task with ID '${id}' not found`);
    }
  }
}
