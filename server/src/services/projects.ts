import { QueryError } from 'mysql2';

import { TPayloadResponse, TResponse } from '@type/schemas/response';
import {
    TProject,
    TProjectCreation,
    TProjectEdit,
    TProjectParticipant,
    TProjectParticipantId,
    TTag
} from '@type/schemas/projects/project';

import { DataAddingError } from '@exceptions/DataAddingError';
import { DataDeletionError } from '@exceptions/DataDeletionError';
import { NoDataError } from '@exceptions/NoDataError';
import { DataModificationError } from '@exceptions/DataModificationError';

import { sqlPool } from '@configs/sqlPool';
import { concat } from '@utils/concat';

type TDependency<T> = { projectId?: number } & T;
type TGetSqlReturn = [undefined | string, undefined | string, string];
type TGetSql<T> = (
    projectId: number,
    data: Array<T> | undefined,
    deleteData: number[] | undefined
) => TGetSqlReturn;

interface ProjectsService {
    getProjects: (...projectIds: number[]) => Promise<TPayloadResponse<TProject[]>>;
    createProject: (projectData: TProjectCreation) => Promise<TResponse>;
    editProject: (projectData: TProjectEdit) => Promise<TPayloadResponse<TProject>>;
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
        read: {
            getSelectProjects: (projectIds: number[]) => `SELECT project_id          AS projectId,
                                                           date_start          AS dateStart,
                                                           date_end            AS dateEnd,
                                                           participants_amount AS participantsAmount,
                                                           tags_amount         AS tagsAmount,
                                                           name,
                                                           description
                                                    FROM tbl_projects
                                                    WHERE project_id IN (${projectIds.toString()})`,
            getSelectTags: (
                projectIds: number[]
            ) => `SELECT tp.project_id AS projectId, pt.tag_id AS tagId, pt.name AS tag
            FROM (SELECT project_id, tag_id
                  FROM tbl_tags_of_projects
                  WHERE project_id IN (${projectIds.toString()})) AS tp
                     JOIN tbl_project_tags pt ON pt.tag_id = tp.tag_id`,
            getSelectParticipants: (projectIds: number[]) => `SELECT up.project_id AS projectId,
                                                               u.user_id     AS userId,
                                                               u.username,
                                                               pr.name       AS name,
                                                               pr.role_id    AS roleId
                                                        FROM (SELECT project_id, user_id, project_role_id
                                                              FROM tbl_users_of_projects
                                                              WHERE project_id IN (${projectIds.toString()})) AS up
                                                                 JOIN tbl_users u ON u.user_id = up.user_id
                                                                 JOIN tbl_project_roles pr ON pr.role_id = up.project_role_id`
        },
        create: {
            insertProject: `INSERT INTO tbl_projects(name, participants_amount, tags_amount, description, date_start,
                                               date_end)
                      VALUES (?, ?, ?, ?, ?, ?)`,
            selectNewProjectId: `SELECT LAST_INSERT_ID() as newProjectId`,
            getInsertUsersSql: (projectId: number, participantIds: TProjectParticipantId[]) =>
                `INSERT INTO tbl_users_of_projects (project_id, user_id, project_role_id)
         VALUES ${participantIds
             .map((p) => `(${projectId},${p.userId},${p.projectRoleId})`)
             .toString()}`,
            getInsertTagsSql: (
                projectId: number,
                tagIds: number[]
            ) => `INSERT INTO tbl_tags_of_projects (project_id, tag_id)
            VALUES ${tagIds.map((tagId) => '(' + projectId + ',' + tagId + ')').toString()}`
        },
        update: {
            getUpdateProjectsSql: (
                projectData: Pick<
                    TProjectEdit,
                    'projectId' | 'dateEnd' | 'dateStart' | 'description' | 'name'
                >
            ) => {
                const { projectId, dateEnd, dateStart, name, description } = projectData;
                return `UPDATE tbl_projects
                SET ${concat([
                    dateEnd ? "date_end = '" + dateEnd.trim() + "'" : '',
                    dateStart ? "date_start = '" + dateStart.trim() + "'" : '',
                    description !== undefined ? "description = '" + description.trim() + "'" : '',
                    name ? "name = '" + name.trim() + "'" : ''
                ])}
                WHERE project_id = ${projectId}`;
            },
            getUpdateParticipantsSql: (
                projectId: number,
                participantIds: TProjectParticipantId[] | undefined,
                deleteParticipantIds: number[] | undefined
            ): TGetSqlReturn => {
                const updateAmount = `UPDATE tbl_projects AS p
                              SET p.participants_amount = (SELECT COUNT(up.project_id)
                                                           FROM tbl_users_of_projects AS up
                                                           WHERE up.project_id = ${projectId})
                              WHERE p.project_id = ${projectId}`;
                const insertSql =
                    participantIds && this._sql.create.getInsertUsersSql(projectId, participantIds);
                const deleteSql =
                    deleteParticipantIds &&
                    `DELETE
           FROM tbl_users_of_projects
           WHERE project_id = ${projectId}
             AND user_id IN (${deleteParticipantIds.toString()}`;

                return [insertSql, deleteSql, updateAmount];
            },
            getUpdateTagsSql: (
                projectId: number,
                tagIds: number[] | undefined,
                deleteTagIds: number[] | undefined
            ): TGetSqlReturn => {
                const insertSql = tagIds && this._sql.create.getInsertTagsSql(projectId, tagIds);
                const updateAmount = `UPDATE tbl_projects AS p
                              SET p.tags_amount = (SELECT COUNT(tp.project_id)
                                                   FROM tbl_tags_of_projects AS tp
                                                   WHERE tp.project_id = ${projectId})
                              WHERE p.project_id = ${projectId}`;
                const deleteSql =
                    deleteTagIds &&
                    `DELETE
           FROM tbl_tags_of_projects
           WHERE project_id = ${projectId}
             AND tag_id IN (${deleteTagIds.toString()})`;

                return [insertSql, deleteSql, updateAmount];
            }
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

    public getProjects = async (...projectIds: number[]): Promise<TPayloadResponse<TProject[]>> => {
        const { getSelectProjects, getSelectParticipants, getSelectTags } = this._sql.read;

        const dbProjectResponse = await sqlPool.query(getSelectProjects(projectIds));
        const [dbProjects] = dbProjectResponse as any[];
        if (!dbProjects.length) throw new NoDataError(`No projects found, id: '${projectIds}'`);

        const projects = dbProjects as TProject[];

        const dbParticipantsResponse = await sqlPool.query(getSelectParticipants(projectIds));
        const [dbParticipants] = dbParticipantsResponse as any[];
        if (dbParticipants.length)
            projects.forEach((project) => {
                const participants = dbParticipants as Array<TDependency<TProjectParticipant>>;
                project.participants = participants
                    .filter((participant) => participant.projectId === project.projectId)
                    .map((participant) => {
                        delete participant['projectId'];
                        return participant;
                    });
            });

        const dbTagsResponse = await sqlPool.query(getSelectTags(projectIds));
        const [dbTags] = dbTagsResponse as any[];
        if (dbTags.length)
            projects.forEach((project) => {
                const tags = dbTags as Array<TDependency<TTag>>;
                project.tags = tags
                    .filter((tag) => tag.projectId === project.projectId)
                    .map((tag) => {
                        delete tag['projectId'];
                        return tag;
                    });
            });

        return {
            message: 'Successfully got projects',
            payload: projects
        };
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
                const insertProjectUsers = getInsertUsersSql(newProjectId, participantIds);
                await connection.query(insertProjectUsers, newProjectId);
            }
            if (tagIds.length) {
                const insertProjectTags = getInsertTagsSql(newProjectId, tagIds);
                await connection.query(insertProjectTags, newProjectId);
            }

            await connection.commit();
        } catch (error: unknown) {
            await connection.rollback();
            const { code } = error as QueryError;

            if (code === 'ER_NO_REFERENCED_ROW_2')
                throw new DataAddingError('Specified participant or project role are not exists!');
            else if (code === 'ER_DUP_ENTRY')
                throw new DataAddingError(`Project '${name}' already exists!`);
            throw error;
        } finally {
            connection.release();
        }

        return { message: `Successfully added new project, name: ${name}` };
    };

    public editProject = async (projectData: TProjectEdit): Promise<TPayloadResponse<TProject>> => {
        const updateDependent = async <T>(
            getSql: TGetSql<T>,
            projectId: number,
            data: Array<T> | undefined,
            deleteData: number[] | undefined,
            errNoRefStr: string,
            errDupEntryStr: string = errNoRefStr
        ) => {
            const [insertSql, deleteSql, updateAmountSql] = getSql(projectId, data, deleteData);
            if (deleteSql) await connection.query(deleteSql);
            try {
                if (insertSql) await connection.query(insertSql);
            } catch (error: unknown) {
                const { code } = error as QueryError;
                if (code === 'ER_NO_REFERENCED_ROW_2')
                    throw new DataModificationError(
                        `Specified project, ${errNoRefStr} are not exists!`
                    );
                else if (code === 'ER_DUP_ENTRY')
                    throw new DataModificationError(
                        `Specified ${errDupEntryStr} already added to this project!`
                    );
                throw error;
            }
            if (deleteSql || insertSql) await connection.query(updateAmountSql);
        };

        const {
            projectId,
            participantIds,
            deleteParticipantIds,
            tagIds,
            deleteTagIds,
            ...projectCommonData
        } = projectData;
        const { getUpdateProjectsSql, getUpdateParticipantsSql, getUpdateTagsSql } =
            this._sql.update;

        const connection = await sqlPool.getConnection();
        try {
            await connection.beginTransaction();
            await connection.query(getUpdateProjectsSql({ projectId, ...projectCommonData }));
            await updateDependent<number>(getUpdateTagsSql, projectId, tagIds, deleteTagIds, 'tag');
            await updateDependent<TProjectParticipantId>(
                getUpdateParticipantsSql,
                projectId,
                participantIds,
                deleteParticipantIds,
                'participant or project role',
                'user'
            );
            await connection.commit();
        } catch (error: unknown) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }

        const {
            payload: [project]
        } = await this.getProjects(projectId);
        return {
            message: `Successfully updated project, name: ${project.name}`,
            payload: project
        };
    };
}

export const projectsService = new ProjectsServiceImpl();
