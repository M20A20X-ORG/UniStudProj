import { RequestHandler } from 'express';
import { TProjectCreation, TProjectEdit, TProjectJson } from '@type/schemas/projects/project';

import { DataDeletionError } from '@exceptions/DataDeletionError';
import { DataAddingError } from '@exceptions/DataAddingError';
import { DataModificationError } from '@exceptions/DataModificationError';
import { NoDataError } from '@exceptions/NoDataError';

import { sendResponse } from '@utils/sendResponse';

import { projectsService } from '@services/projectsService';
import { LIMIT_DEFAULT } from '@static/common';

interface ProjectsController {
    getGetProject: RequestHandler;
    postCreateProject: RequestHandler;
    putEditProject: RequestHandler;
    deleteDeleteProject: RequestHandler;
}

class ProjectsControllerImpl implements ProjectsController {
    public deleteDeleteProject: RequestHandler = async (req, res) => {
        try {
            const projectId = parseInt(req.query.projectId as string);
            const serviceResponse = await projectsService.deleteProject(projectId);
            return res.status(200).json(serviceResponse);
        } catch (error: unknown) {
            const { message, stack } = error as Error;
            let responseStatus = 500;
            if (error instanceof DataDeletionError) responseStatus = 409;
            return sendResponse(res, responseStatus, message, stack);
        }
    };

    public getGetTags: RequestHandler = async (req, res) => {
        try {
            const limit = parseInt(req.query.limit as string) || LIMIT_DEFAULT;
            const serviceResponse = await projectsService.getTags(limit);
            return res.status(200).json(serviceResponse);
        } catch (error: unknown) {
            const { message, stack } = error as Error;
            return sendResponse(res, 500, message, stack);
        }
    };

    public getGetProject: RequestHandler = async (req, res) => {
        try {
            const limit = parseInt(req.query.limit as string);
            const projectIds = ((req.query.projectIds as string[]) || []).map((id) => parseInt(id));
            const serviceResponse = await projectsService.getProjects(projectIds, limit);
            return res.status(200).json(serviceResponse);
        } catch (error: unknown) {
            const { message, stack } = error as Error;
            let responseStatus = 500;
            if (error instanceof NoDataError) responseStatus = 404;
            return sendResponse(res, responseStatus, message, stack);
        }
    };

    public postCreateProject: RequestHandler = async (req, res) => {
        const { project } = req.body as TProjectJson<TProjectCreation>;

        try {
            const serviceResponse = await projectsService.createProject(project);
            return res.status(201).json(serviceResponse);
        } catch (error: unknown) {
            const { message, stack } = error as Error;
            let responseStatus = 500;
            if (error instanceof DataAddingError) responseStatus = 409;
            return sendResponse(res, responseStatus, message, stack);
        }
    };

    public putEditProject: RequestHandler = async (req, res) => {
        try {
            const { project } = req.body as TProjectJson<TProjectEdit>;
            const serviceResponse = await projectsService.editProject(project);
            return res.status(200).json(serviceResponse);
        } catch (error: unknown) {
            const { message, stack } = error as Error;
            let responseStatus = 500;
            if (error instanceof DataModificationError) responseStatus = 409;
            return sendResponse(res, responseStatus, message, stack);
        }
    };
}

export const projectsController = new ProjectsControllerImpl();
