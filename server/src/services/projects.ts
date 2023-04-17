import { QueryError } from 'mysql2';

import { TPayloadResponse, TResponse } from '@type/schemas/response';
import {
    TProject,
    TProjectCreation,
    TProjectPartial,
    TProjectParticipantId
} from '@type/schemas/projects/project';

import { DataAddingError } from '@exceptions/DataAddingError';
import { DataDeletionError } from '@exceptions/DataDeletionError';

import { concat } from '@utils/concat';
import { sqlPool } from '@configs/sqlPool';

interface ProjectsService {
    getProject?: (projectId: number) => Promise<TPayloadResponse<TProject>>;
    addProject: (projectData: TProjectCreation) => Promise<TResponse>;
    editProject?: (projectData: TProjectPartial) => Promise<TPayloadResponse<TProject>>;
    deleteProject: (projectId: number) => Promise<TResponse>;
}

class ProjectsServiceImpl implements ProjectsService {
    private _sql = {
        create: {
            insertProject: `INSERT INTO tbl_projects(name, participants_amount, description, date_start, date_end)
                            VALUES (?, ?, ?, ?, ?)`,
            selectNewProjectId: `SELECT LAST_INSERT_ID() as newProjectId`,
            getInsertProjectUsers: (projectId: number, participantIds: TProjectParticipantId[]) =>
                'INSERT INTO tbl_users_of_projects (project_id, user_id, project_role_id) VALUES'.concat(
                    concat([
                        ...participantIds.map(
                            ({ userId, projectRoleId }) =>
                                `(${projectId},${userId},${projectRoleId})`
                        )
                    ])
                ),
            getInsertProjectTags: (projectId: number, tagIds: number[]) =>
                'INSERT INTO tbl_users_of_projects (project_id, user_id, project_role_id) VALUES'.concat(
                    concat([...tagIds.map((tagId) => `(${projectId},${tagId})`)])
                )
        }
    };
    public deleteProject = async (projectId: number): Promise<TResponse> => {
        const sql = {
            selectProjectName: `SELECT name
                                FROM tbl_projects
                                WHERE project_id = ?`,
            deleteProject: `DELETE
                            FROM tbl_projects
                            WHERE project_id = ?`
        };
        const dbProjectNameResponse = await sqlPool.query(sql.selectProjectName, projectId);
        const [[dbProjectName]] = dbProjectNameResponse;
        if (!dbProjectName) throw new DataDeletionError(`No project found, id: '${projectId}'`);

        const { email: name } = dbProjectName;
        await sqlPool.query(sql.deleteProject, projectId);

        return { message: `Successfully deleted project, name: '${name}'` };
    };

    public addProject = async (projectData: TProjectCreation): Promise<TResponse> => {
        const { name, dateStart, dateEnd, participantIds, tagIds, description } = projectData;
        const { insertProject, selectNewProjectId, getInsertProjectUsers, getInsertProjectTags } =
            this._sql.create;

        const connection = await sqlPool.getConnection();
        try {
            await connection.beginTransaction();
            await connection.query(insertProject, [
                name,
                participantIds.length,
                description,
                dateStart,
                dateEnd
            ]);

            const dbNewProjectIdResponse = await connection.query(selectNewProjectId);
            const [[dbNewProjectId]] = dbNewProjectIdResponse;
            if (!dbNewProjectId) throw new DataAddingError("Can't add new project!");
            const { newProjectId } = dbNewProjectId as { newProjectId: number };

            if (participantIds.length) {
                const insertProjectUsers: string = getInsertProjectUsers(
                    newProjectId,
                    participantIds
                );
                await connection.query(insertProjectUsers);
            }
            if (tagIds.length) {
                const insertProjectTags: string = getInsertProjectTags(newProjectId, tagIds);
                await connection.query(insertProjectTags);
            }

            await connection.commit();
        } catch (error: unknown) {
            await connection.rollback();
            const { code } = error as QueryError;

            if (code === 'ER_DUP_ENTRY')
                throw new DataAddingError(`Project '${name}' already exists!`);
            else throw error;
        } finally {
            connection.release();
        }

        return { message: `Successfully added new project, name: ${name}` };
    };
}

export const projectsService = new ProjectsServiceImpl();
