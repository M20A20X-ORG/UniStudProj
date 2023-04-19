import { RequestHandler } from 'express';
import { TResponse } from '@type/schemas/response';
import { TProjectCreation, TProjectJson } from '@type/schemas/projects/project';

import { DataDeletionError } from '@exceptions/DataDeletionError';
import { DataAddingError } from '@exceptions/DataAddingError';

import { log } from '@configs/logger';
import { projectsService } from '@services/projects';

interface ProjectsController {
    getGetProject?: RequestHandler;
    postCreateProject: RequestHandler;
    putEditProject?: RequestHandler;
    deleteDeleteProject: RequestHandler;
}

class ProjectsControllerImpl implements ProjectsController {
    public deleteDeleteProject: RequestHandler = async (req, res) => {
        const projectId = parseInt(req.query.projectId as string);

        try {
            const serviceResponse = await projectsService.deleteProject(projectId);
            return res.status(200).json(serviceResponse);
        } catch (error: unknown) {
            const { message, stack } = error as Error;
            if (error instanceof DataDeletionError) {
                log.warn(message);
                return res.status(409).json({ message } as TResponse);
            }
            log.err(stack ?? message);
            return res.status(500);
        }
    };

    public postCreateProject: RequestHandler = async (req, res) => {
        const { project } = req.body as TProjectJson<TProjectCreation>;

        try {
            const serviceResponse = await projectsService.createProject(project);
            return res.status(200).json(serviceResponse);
        } catch (error: unknown) {
            const { message, stack } = error as Error;
            if (error instanceof DataAddingError) {
                log.warn(message);
                return res.status(409).json({ message } as TResponse);
            }
            log.err(stack ?? message);
            return res.status(500);
        }
    };
}

export const projectsController = new ProjectsControllerImpl();
