import { QueryError } from 'mysql2';

import { TPayloadResponse, TResponse } from '@type/schemas/response';
import {
    TProject,
    TProjectCreation,
    TProjectEdit,
    TProjectParticipant
} from '@type/schemas/projects/project';

import { DataAddingError } from '@exceptions/DataAddingError';
import { DataDeletionError } from '@exceptions/DataDeletionError';
import { DataModificationError } from '@exceptions/DataModificationError';

import { concat } from '@utils/concat';
import { sqlPool } from '@configs/sqlPool';

interface ProjectsService {
    getProject?: (projectId: number) => Promise<TPayloadResponse<TProject>>;
    createProject: (projectData: TProjectCreation) => Promise<TResponse>;
    editProject?: (projectData: TProjectEdit) => Promise<TPayloadResponse<TProject>>;
    deleteProject: (projectId: number) => Promise<TResponse>;
}

class ProjectsServiceImpl implements ProjectsService {
    private _sql = {
        delete: {
            selectProjectName: `SELECT name
                          FROM tbl_projects
                          WHERE project_id = ?`,
            deleteProject: `DELETE
                      FROM tbl_projects
                      WHERE project_id = ?`,
            deleteProjectUsers: `DELETE
                           FROM tbl_users_of_projects
                           WHERE project_id = ?`,
            deleteProjectTags: `DELETE
                          FROM tbl_tags_of_projects
                          WHERE project_id = ?`
        },
        create: {
            insertProject: `INSERT INTO tbl_projects(name, participants_amount, tags_amount, description, date_start,
                                               date_end)
                      VALUES (?, ?, ?, ?, ?, ?)`,
            selectNewProjectId: `SELECT LAST_INSERT_ID() as newProjectId`,
            getInsertUsersSql: (projectId: number, participantIds: TProjectParticipant[]) =>
                `INSERT INTO tbl_users_of_projects (project_id, user_id, project_role_id)
         VALUES ${concat(
             participantIds.map((p) => `(${projectId},${p.userId},${p.projectRoleId})`)
         )}`,
            getInsertTagsSql: (projectId: number, tagIds: number[]) =>
                `INSERT INTO tbl_tags_of_projects (project_id, tag_id)
         VALUES ${concat(tagIds.map((tagId) => '(' + projectId + ',' + tagId + ')'))}`
        }
    };

    public deleteProject = async (projectId: number): Promise<TResponse> => {
        const { selectProjectName, deleteProject, deleteProjectUsers, deleteProjectTags } =
            this._sql.delete;

        const dbProjectNameResponse = await sqlPool.query(selectProjectName, projectId);
        const [[dbProjectName]] = dbProjectNameResponse;
        if (!dbProjectName) throw new DataDeletionError(`No project found, id: '${projectId}'`);

        await sqlPool.query(deleteProject, projectId);
        await sqlPool.query(deleteProjectUsers, projectId);
        await sqlPool.query(deleteProjectTags, projectId);

        const { name } = dbProjectName as TProject;
        return { message: `Successfully deleted project, name: '${name}'` };
    };

    public createProject = async (projectData: TProjectCreation): Promise<TResponse> => {
        const { name, dateStart, dateEnd, participantIds, tagIds, description } = projectData;
        const { insertProject, selectNewProjectId, getInsertUsersSql, getInsertTagsSql } =
            this._sql.create;

        const connection = await sqlPool.getConnection();
        try {
            await connection.beginTransaction();
            await connection.query(insertProject, [
                name,
                participantIds.length,
                tagIds.length,
                description,
                dateStart,
                dateEnd
            ]);

            const dbNewProjectIdResponse = await connection.query(selectNewProjectId);
            const [[dbNewProjectId]] = dbNewProjectIdResponse;
            if (!dbNewProjectId) throw new DataAddingError("Can't add new project!");
            const { newProjectId } = dbNewProjectId as { newProjectId: number };

            if (participantIds.length) {
                const insertProjectUsers: string = getInsertUsersSql(newProjectId, participantIds);
                await connection.query(insertProjectUsers, newProjectId);
            }
            if (tagIds.length) {
                const insertProjectTags: string = getInsertTagsSql(newProjectId, tagIds);
                await connection.query(insertProjectTags, newProjectId);
            }

            await connection.commit();
        } catch (error: unknown) {
            await connection.rollback();
            const { code } = error as QueryError;

            if (code === 'ER_NO_REFERENCED_ROW_2')
                throw new DataModificationError(
                    'Specified participant or project role are not exists!'
                );
            else if (code === 'ER_DUP_ENTRY')
                throw new DataAddingError(`Project '${name}' already exists!`);
            throw error;
        } finally {
            connection.release();
        }

        return { message: `Successfully added new project, name: ${name}` };
    };
}

export const projectsService = new ProjectsServiceImpl();
