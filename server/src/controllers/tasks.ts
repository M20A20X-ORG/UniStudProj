import { RequestHandler } from 'express';
import { TTaskCreation, TTaskEdit, TTaskJson } from '@type/schemas/projects/tasks';

import { DataDeletionError } from '@exceptions/DataDeletionError';
import { DataAddingError } from '@exceptions/DataAddingError';
import { NoDataError } from '@exceptions/NoDataError';
import { DataModificationError } from '@exceptions/DataModificationError';

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
        try {
            const projectId = parseInt(req.query.projectId as string);
            const taskId = parseInt(req.query.taskId as string);

            const serviceResponse = await tasksService.deleteTask(projectId, taskId);
            return res.status(200).json(serviceResponse);
        } catch (error: unknown) {
            const { message, stack } = error as Error;

            let status = 500;
            if (error instanceof DataDeletionError) status = 409;

            return sendResponse(res, status, message, stack);
        }
    };

    public getGetTask: RequestHandler = async (req, res) => {
        try {
            const projectId = parseInt(req.query.projectId as string);
            const serviceResponse = await tasksService.getTasks(projectId);
            return res.status(201).json(serviceResponse);
        } catch (error: unknown) {
            const { message, stack } = error as Error;
            let responseStatus = 500;
            if (error instanceof NoDataError) responseStatus = 404;
            return sendResponse(res, responseStatus, message, stack);
        }
    };

    public postCreateTask: RequestHandler = async (req, res) => {
        try {
            const { task } = req.body as TTaskJson<TTaskCreation>;
            const serviceResponse = await tasksService.createTask(task);
            return res.status(200).json(serviceResponse);
        } catch (error: unknown) {
            const { message, stack } = error as Error;

            let status = 500;
            if (error instanceof DataAddingError) status = 409;

            return sendResponse(res, status, message, stack);
        }
    };

    public putEditTask: RequestHandler = async (req, res) => {
        try {
            const { task } = req.body as TTaskJson<TTaskEdit>;
            const serviceResponse = await tasksService.editTask(task);
            return res.status(201).json(serviceResponse);
        } catch (error: unknown) {
            const { message, stack } = error as Error;
            let responseStatus = 500;
            if (error instanceof DataModificationError) responseStatus = 409;
            return sendResponse(res, responseStatus, message, stack);
        }
    };
}

export const tasksController = new TasksControllerImpl();
