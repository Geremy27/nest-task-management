import * as uuid from 'uuid/v1';
import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTaskDTO } from './dto/create-task.dto';
import { Task, TaskStatus } from './tasks.model';
import { GetTasksFilterDTO } from './dto/get-tasks-filter.dto';

@Injectable()
export class TasksService {
  private tasks: Task[] = [];

  getAllTasks(): Task[] {
    return this.tasks;
  }

  getTasksWithFilters({ status, search }: GetTasksFilterDTO): Task[] {
    let tasks = this.getAllTasks();

    if (status) {
      tasks = tasks.filter(task => task.status === status);
    }

    if (search) {
      tasks = tasks.filter(
        ({ title, description }) =>
          title.includes(search) || description.includes(search)
      );
    }

    return tasks;
  }

  getTaskById(id: string): Task {
    const foundTask = this.tasks.find(task => task.id === id);

    if (!foundTask) {
      throw new NotFoundException(`Task with ID '${id}' not found`);
    }

    return foundTask;
  }

  createTask({ title, description }: CreateTaskDTO): Task {
    const task: Task = {
      id: uuid(),
      title,
      description,
      status: TaskStatus.OPEN,
    };

    this.tasks.push(task);
    return task;
  }

  updateTaskStatus(id: string, newStatus: TaskStatus) {
    const task = this.getTaskById(id);
    task.status = newStatus;
    return task;
  }

  deleteTaskById(id: string): void {
    const taskToDelete = this.getTaskById(id);
    this.tasks = this.tasks.filter(task => task.id !== id);
  }
}