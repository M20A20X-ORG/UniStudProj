import { QueryError } from 'mysql2';
import { TDependency, TModifyQueryResponse, TReadQueryResponse } from '@type/sql';
import { TPayloadResponse, TResponse } from '@type/schemas/response';
import {
    TProject,
    TProjectCreation,
    TProjectEdit,
    TProjectId,
    TProjectParticipant,
    TProjectParticipantId,
    TTag
} from '@type/schemas/projects/project';

import { DataAddingError } from '@exceptions/DataAddingError';
import { DataDeletionError } from '@exceptions/DataDeletionError';
import { NoDataError } from '@exceptions/NoDataError';

import { PROJECT_SQL } from '@static/sql/projects';
import { COMMON_SQL } from '@static/sql/common';

import { updateDependent } from '@utils/updateDependent';

import { sqlPool } from '@configs/sqlPoolConfig';
import { log } from '@configs/loggerConfig';

const { readSql, deleteSql, createSql, updateSql } = PROJECT_SQL;
const { getSelectLastInsertId } = COMMON_SQL;

interface ProjectsService {
    getProjects: (...projectIds: number[]) => Promise<TPayloadResponse<TProject[]>>;
    createProject: (projectData: TProjectCreation) => Promise<TResponse>;
    editProject: (projectData: TProjectEdit) => Promise<TPayloadResponse<TProject>>;
    deleteProject: (projectId: number) => Promise<TResponse>;
}

class ProjectsServiceImpl implements ProjectsService {
    public deleteProject = async (projectId: number): Promise<TResponse> => {
        const { selectProjectName, deleteProject, deleteProjectUsers, deleteProjectTags }
            = deleteSql;

        const dbProjectNameResponse: TReadQueryResponse = await sqlPool.query(
            selectProjectName,
            projectId
        );
        const [[dbProjectName]] = dbProjectNameResponse;
        if (!dbProjectName) throw new DataDeletionError(`No project found, id: '${projectId}'`);

        const dbDeleteProjectResponse: TModifyQueryResponse = await sqlPool.query(
            deleteProject,
            projectId
        );
        log.debug(dbDeleteProjectResponse);

        const dbDeleteUsersResponse: TModifyQueryResponse = await sqlPool.query(
            deleteProjectUsers,
            projectId
        );
        log.debug(dbDeleteUsersResponse);

        const dbDeleteTagsResponse: TModifyQueryResponse = await sqlPool.query(
            deleteProjectTags,
            projectId
        );
        log.debug(dbDeleteTagsResponse);

        const { name } = dbProjectName as TProject;
        return { message: `Successfully deleted project, name: '${name}'` };
    };

    public getProjects = async (...projectIds: number[]): Promise<TPayloadResponse<TProject[]>> => {
        const { getSelectProjects, getSelectParticipants, getSelectTags } = readSql;

        const selectProjectsSql = getSelectProjects(projectIds);
        const dbProjectResponse: TReadQueryResponse = await sqlPool.query(selectProjectsSql);
        const [dbProjects] = dbProjectResponse;
        if (!dbProjects.length) throw new NoDataError(`No projects found, id: '${projectIds}'`);

        const projects = dbProjects as TProject[];

        const selectParticipantsSql = getSelectParticipants(projectIds);
        const dbParticipantsResponse: TReadQueryResponse = await sqlPool.query(
            selectParticipantsSql
        );
        const [dbParticipants] = dbParticipantsResponse;
        if (dbParticipants.length) {
            projects.forEach((project) => {
                const participants = dbParticipants as TDependency<
                    TProjectId,
                    TProjectParticipant
                >[];
                project.participants = participants
                    .filter((participant) => participant.projectId === project.projectId)
                    .map((participant) => {
                        delete participant['projectId'];
                        return participant;
                    });
            });
        }

        const selectTagsSql: string = getSelectTags(projectIds);
        const dbTagsResponse: TReadQueryResponse = await sqlPool.query(selectTagsSql);
        const [dbTags] = dbTagsResponse;
        if (dbTags.length)
            projects.forEach((project) => {
                const tags = dbTags as TDependency<TProjectId, TTag>[];
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
        const { insertProject, getInsertUsersSql, getInsertTagsSql } = createSql;

        const connection = await sqlPool.getConnection();
        try {
            await connection.beginTransaction();
            const dbProjectResponse: TModifyQueryResponse = await connection.query(insertProject, [
                name,
                participantIds.length,
                tagIds.length,
                description,
                dateStart,
                dateEnd
            ]);
            log.debug(dbProjectResponse);

            const dbNewProjectIdResponse: TReadQueryResponse = await connection.query(
                getSelectLastInsertId('projectId')
            );
            const [[dbNewProjectId]] = dbNewProjectIdResponse;
            if (!dbNewProjectId) throw new DataAddingError("Can't add new project!");
            const { newProjectId } = dbNewProjectId as { newProjectId: number };

            if (participantIds.length) {
                const insertProjectUsersSql = getInsertUsersSql(newProjectId, participantIds);
                const dbProjectUsersResponse = await connection.query(
                    insertProjectUsersSql,
                    newProjectId
                );
                log.debug(dbProjectUsersResponse);
            }
            if (tagIds.length) {
                const insertProjectTagsSql = getInsertTagsSql(newProjectId, tagIds);
                const dbProjectTagsResponse = await connection.query(
                    insertProjectTagsSql,
                    newProjectId
                );
                log.debug(dbProjectTagsResponse);
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
        const {
            projectId,
            participantIds,
            deleteParticipantIds,
            tagIds,
            deleteTagIds,
            ...projectCommonData
        } = projectData;
        const { getUpdateProjectSql, getUpdateParticipantsSql, getUpdateTagsSql } = updateSql;

        const connection = await sqlPool.getConnection();
        try {
            await connection.beginTransaction();
            const updateProjectSql = getUpdateProjectSql({ projectId, ...projectCommonData });
            const dbProjectResponse: TModifyQueryResponse = await connection.query(
                updateProjectSql
            );
            log.debug(dbProjectResponse);

            await updateDependent<number>(
                connection,
                getUpdateTagsSql,
                projectId,
                tagIds,
                deleteTagIds,
                'tag'
            );
            await updateDependent<TProjectParticipantId>(
                connection,
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
