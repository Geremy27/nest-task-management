import { NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { TaskRepository } from './task.repository';
import { TasksService } from './tasks.service';
import { GetTasksFilterDTO } from './dto/get-tasks-filter.dto';
import { TaskStatus } from './task-status.enum';

const mockUser = {
  id: 1,
  username: 'Test User',
};

const mockTask = {
  title: 'Test',
  description: 'Expect success',
};

const createTaskDTO = {
  title: 'Test',
  description: 'Expect success',
};

const mockTaskRepository = () => ({
  getTasks: jest.fn(),
  findOne: jest.fn(),
  createTask: jest.fn(),
  delete: jest.fn(),
  updateTaskStatus: jest.fn(),
});

describe('TasksService', () => {
  let tasksService;
  let taskRepository;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        TasksService,
        { provide: TaskRepository, useFactory: mockTaskRepository },
      ],
    }).compile();

    tasksService = await module.get<TasksService>(TasksService);
    taskRepository = await module.get<TaskRepository>(TaskRepository);
  });

  describe('getTasks', () => {
    it('Gets all tasks from the repository', async () => {
      taskRepository.getTasks.mockResolvedValue('Some value');
      expect(taskRepository.getTasks).not.toHaveBeenCalled();
      const filters: GetTasksFilterDTO = {
        status: TaskStatus.IN_PROGRESS,
        search: 'some search query',
      };

      const result = await tasksService.getTasks(filters, mockUser);

      expect(taskRepository.getTasks).toHaveBeenCalled();
      expect(result).toEqual('Some value');
    });
  });

  describe('getTaskById', () => {
    it('Calls taskRepository.findOne() and successfully retrieves and returns the task.', async () => {
      taskRepository.findOne.mockResolvedValue(mockTask);
      const result = await tasksService.getTaskById(1, mockUser);

      expect(result).toEqual(mockTask);
      expect(taskRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1, userId: mockUser.id },
      });
    });
    it('Throws error as task is not found.', () => {
      taskRepository.findOne.mockResolvedValue(null);
      expect(tasksService.getTaskById(1, mockUser)).rejects.toThrow(
        NotFoundException
      );
    });
  });

  describe('createTask', () => {
    it('Calls taskRepository.create() and returns the result.', async () => {
      taskRepository.createTask.mockResolvedValue(mockTask);
      expect(taskRepository.createTask).not.toHaveBeenCalled();
      const result = await tasksService.createTask(createTaskDTO, mockUser);
      expect(taskRepository.createTask).toHaveBeenCalledWith(
        createTaskDTO,
        mockUser
      );
      expect(result).toEqual(mockTask);
    });
  });

  describe('deleteTask', () => {
    it('Calls taskRepository.deleteTask() to delete a task.', async () => {
      taskRepository.delete.mockResolvedValue({ affected: 1 });
      expect(taskRepository.delete).not.toHaveBeenCalled();
      await tasksService.deleteTaskById(1, mockUser);
      expect(taskRepository.delete).toHaveBeenCalledWith({
        id: 1,
        userId: mockUser.id,
      });
    });
    it('Throws an error, task could not be found.', async () => {
      taskRepository.delete.mockResolvedValue({ affected: 0 });
      expect(tasksService.deleteTaskById(1, mockUser)).rejects.toThrow(
        NotFoundException
      );
    });
  });

  describe('updateTaskStatus', () => {
    it('Updates tasks status', async () => {
      const save = jest.fn().mockResolvedValue(true);
      tasksService.getTaskById = jest.fn().mockResolvedValue({
        status: TaskStatus.OPEN,
        save,
      });
      expect(tasksService.getTaskById).not.toHaveBeenCalled();
      expect(save).not.toHaveBeenCalled();
      const result = await tasksService.updateTaskStatus(
        1,
        TaskStatus.DONE,
        mockUser
      );
      expect(tasksService.getTaskById).toHaveBeenCalled();
      expect(save).toHaveBeenCalled();
      expect(result.status).toEqual(TaskStatus.DONE);
    });
  });
});
