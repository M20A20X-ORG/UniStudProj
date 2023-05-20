import { QueryError } from 'mysql2';
import { TDependency, TModifyQueryResponse, TReadQueryResponse } from '@type/sql';
import { TResponse } from '@type/schemas/response';
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
    getProjects: (projectIds: number[], limit: number) => Promise<TResponse<TProject[]>>;
    createProject: (projectData: TProjectCreation) => Promise<TResponse<TProjectId>>;
    editProject: (projectData: TProjectEdit) => Promise<TResponse>;
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

    public getTags = async (limit: number): Promise<TResponse<TTag[]>> => {
        const { getSelectTags } = readSql;

        const selectTagsSql: string = getSelectTags(limit);
        const dbTagsResponse: TReadQueryResponse = await sqlPool.query(selectTagsSql);
        const [dbTags] = dbTagsResponse;

        return {
            message: 'Successfully get tags',
            payload: dbTags as TTag[]
        };
    };

    public getProjects = async (
        projectIds: number[],
        limit: number
    ): Promise<TResponse<TProject[]>> => {
        const { getSelectProjects, getSelectParticipants, getSelectTagsOfProjects } = readSql;

        const selectProjectsSql = getSelectProjects(projectIds, limit);
        const dbProjectResponse: TReadQueryResponse = await sqlPool.query(selectProjectsSql);
        const [dbProjects] = dbProjectResponse;
        if (!dbProjects.length) throw new NoDataError(`No projects found, id: '${projectIds}'`);

        const projects = dbProjects as TProject[];
        const selectedProjectIds: number[] = projectIds.length
            ? projectIds
            : projects.map(({ projectId }) => projectId);

        const selectParticipantsSql = getSelectParticipants(selectedProjectIds);
        const dbParticipantsResponse: TReadQueryResponse = await sqlPool.query(
            selectParticipantsSql
        );
        const [dbParticipants] = dbParticipantsResponse;

        projects.forEach((project) => {
            const participants = dbParticipants as TDependency<TProjectId, TProjectParticipant>[];
            project.participants = participants
                .filter((participant) => participant.projectId === project.projectId)
                .map((participant) => {
                    delete participant['projectId'];
                    return participant;
                });
        });

        const selectTagsSql: string = getSelectTagsOfProjects(selectedProjectIds);
        const dbTagsResponse: TReadQueryResponse = await sqlPool.query(selectTagsSql);
        const [dbTags] = dbTagsResponse;

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

    public createProject = async (
        projectData: TProjectCreation
    ): Promise<TResponse<TProjectId>> => {
        const { name, dateStart, dateEnd, newParticipantIds, newTagIds, description } = projectData;
        const { insertProject, getInsertUsersSql, getInsertTagsSql } = createSql;

        const connection = await sqlPool.getConnection();
        try {
            await connection.beginTransaction();
            const dbProjectResponse: TModifyQueryResponse = await connection.query(insertProject, [
                name,
                newParticipantIds.length,
                newTagIds.length,
                description,
                dateStart,
                dateEnd
            ]);
            log.debug(dbProjectResponse);

            const ID_ALIAS = 'newProjectId';
            const dbNewProjectIdResponse: TReadQueryResponse = await connection.query(
                getSelectLastInsertId(ID_ALIAS)
            );
            const [[dbNewProjectId]] = dbNewProjectIdResponse;
            if (!dbNewProjectId) throw new DataAddingError("Can't add new project!");
            const { [ID_ALIAS]: newProjectId } = dbNewProjectId as { [ID_ALIAS]: number };

            if (newParticipantIds.length) {
                const insertProjectUsersSql = getInsertUsersSql(newProjectId, newParticipantIds);
                const dbProjectUsersResponse = await connection.query(
                    insertProjectUsersSql,
                    newProjectId
                );
                log.debug(dbProjectUsersResponse);
            }
            if (newTagIds.length) {
                const insertProjectTagsSql = getInsertTagsSql(newProjectId, newTagIds);
                const dbProjectTagsResponse = await connection.query(
                    insertProjectTagsSql,
                    newProjectId
                );
                log.debug(dbProjectTagsResponse);
            }

            await connection.commit();
            return {
                message: `Successfully create new project, id: ${newProjectId}`,
                payload: { projectId: newProjectId }
            };
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
    };

    public editProject = async (projectData: TProjectEdit): Promise<TResponse> => {
        const {
            projectId,
            newParticipantIds,
            deleteParticipantIds,
            newTagIds,
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
                newTagIds,
                deleteTagIds,
                'tag'
            );
            await updateDependent<TProjectParticipantId>(
                connection,
                getUpdateParticipantsSql,
                projectId,
                newParticipantIds,
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

        return { message: `Successfully update project, id: ${projectData.projectId}` };
    };
}

export const projectsService = new ProjectsServiceImpl();
