import { QueryError } from 'mysql2';

import { TDependency, TGetSql } from '@type/sql';
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
import { DataModificationError } from '@exceptions/DataModificationError';

import { sqlPool } from '@configs/sqlPool';
import { PROJECT_SQL } from '@static/sql/projects';

const { readSql, deleteSql, createSql, updateSql } = PROJECT_SQL;

interface ProjectsService {
    getProjects: (...projectIds: number[]) => Promise<TPayloadResponse<TProject[]>>;
    createProject: (projectData: TProjectCreation) => Promise<TResponse>;
    editProject: (projectData: TProjectEdit) => Promise<TPayloadResponse<TProject>>;
    deleteProject: (projectId: number) => Promise<TResponse>;
}

class ProjectsServiceImpl implements ProjectsService {
    public deleteProject = async (projectId: number): Promise<TResponse> => {
        const { selectProjectName, deleteProject, deleteProjectUsers, deleteProjectTags } =
            deleteSql;

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
        const { getSelectProjects, getSelectParticipants, getSelectTags } = readSql;

        const dbProjectResponse = await sqlPool.query(getSelectProjects(projectIds));
        const [dbProjects] = dbProjectResponse as any[];
        if (!dbProjects.length) throw new NoDataError(`No projects found, id: '${projectIds}'`);

        const projects = dbProjects as TProject[];

        const dbParticipantsResponse = await sqlPool.query(getSelectParticipants(projectIds));
        const [dbParticipants] = dbParticipantsResponse as any[];
        if (dbParticipants.length)
            projects.forEach((project) => {
                const participants = dbParticipants as Array<
                    TDependency<TProjectId, TProjectParticipant>
                >;
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
                const tags = dbTags as Array<TDependency<TProjectId, TTag>>;
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
            createSql;

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
        const { getUpdateProjectsSql, getUpdateParticipantsSql, getUpdateTagsSql } = updateSql;

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
