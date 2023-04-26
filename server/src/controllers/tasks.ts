import { RequestHandler } from 'express';
import { TTaskCreation, TTaskJson } from '@type/schemas/projects/tasks';

import { DataDeletionError } from '@exceptions/DataDeletionError';
import { DataAddingError } from '@exceptions/DataAddingError';

import { sendResponse } from '@utils/sendResponse';
import { tasksService } from '@services/tasks';

interface TasksController {
    getGetTask?: RequestHandler;
    postCreateTask: RequestHandler;
    putEditTask?: RequestHandler;
    deleteDeleteTask: RequestHandler;
}

class TasksControllerImpl implements TasksController {
    public deleteDeleteTask: RequestHandler = async (req, res) => {
        const projectId = parseInt(req.query.projectId as string);
        const taskId = parseInt(req.query.taskId as string);

        try {
            const serviceResponse = await tasksService.deleteTask(projectId, taskId);
            return res.status(200).json(serviceResponse);
        } catch (error: unknown) {
            const { message, stack } = error as Error;

            let status = 500;
            if (error instanceof DataDeletionError) status = 409;

            return sendResponse(res, status, message, stack);
        }
    };

    public postCreateTask: RequestHandler = async (req, res) => {
        const { task } = req.body as TTaskJson<TTaskCreation>;

        try {
            const serviceResponse = await tasksService.createTask(task);
            return res.status(200).json(serviceResponse);
        } catch (error: unknown) {
            const { message, stack } = error as Error;

            let status = 500;
            if (error instanceof DataAddingError) status = 409;

            return sendResponse(res, status, message, stack);
        }
    };
}

export const tasksController = new TasksControllerImpl();
