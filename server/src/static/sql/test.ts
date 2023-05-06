import { TUpdateDependentSql } from '@type/sql';
import { TProjectId } from '@type/schemas/projects/project';
import {
    TTest,
    TTestCreation,
    TTestEdit,
    TTestId,
    TUserNeedTest,
    TUsersNeedTests
} from '@type/schemas/tests/test';

import { LIMIT_DEFAULT } from '@static/common';
import { concat } from '@utils/concat';

type TTestEditCommon = Omit<TTestEdit, 'questionIds' | 'projectId' | 'deleteQuestionIds'>;
type TTestCreationCommon = Omit<TTestCreation, 'questionIds' | 'newQuestions'> &
    Pick<TTest, 'questionsAmount'>;

export const TEST_SQL = {
    createSql: {
        getInsertTestsOfProjects: (tests: Array<TProjectId & TTestId>): string => {
            const values = tests.map((t) => `(${[t.testId, t.projectId]})`);
            return `
                INSERT INTO tbl_tests_of_projects(test_id, project_id)
                VALUES ${values}`;
        },
        getInsertTestCommon: (testsCommonData: TTestCreationCommon): string => {
            const t = testsCommonData;
            const value = `('${t.name}',${t.timeLimit},${t.questionsAmount},'${t.dateStart}','${t.dateEnd}',${t.passingScore})`;
            return `
                INSERT INTO tbl_tests(name, time_limit, questions_amount, date_start, date_end, passing_score)
                VALUES ${value}`;
        },
        getInsertQuestionsOfTests: (testId: number, questionIds: number[]): string => {
            const values = questionIds.map((id) => `(${[testId, id]})`);
            return `
                INSERT INTO tbl_questions_of_tests(test_id, question_id)
                VALUES ${values}`;
        }
    },
    readSql: {
        getSelectTest: (needSpecifiedId = true) => `
            SELECT test_id          AS testId,
                   name,
                   time_limit       AS timeLimit,
                   questions_amount AS questionsAmount,
                   date_start       AS dateStart,
                   date_end         AS dateEnd,
                   passing_score    AS passingScore
            FROM tbl_tests ${needSpecifiedId ? ' WHERE test_id = ?' : ' LIMIT ' + LIMIT_DEFAULT}`,
        selectQuestionIds: `
            SELECT test_id AS testId, question_id AS questionId
            FROM tbl_questions_of_tests
            WHERE test_id = ?`
    },
    updateSql: {
        getUpdateTestCommon: (testData: TTestEditCommon): string => {
            const { testId, name, timeLimit, dateStart, dateEnd, passingScore } = testData;
            const vales = concat([
                name ? "name = '" + name.trim() + "'" : '',
                timeLimit ? 'time_limit = ' + timeLimit : '',
                dateStart ? "date_start = '" + dateStart.trim() + "'" : '',
                dateEnd ? "date_end = '" + dateEnd.trim() + "'" : '',
                passingScore ? 'passing_score = ' + passingScore : ''
            ]);
            return (
                vales
                && `
                  UPDATE tbl_tests
                  SET ${vales}
                  WHERE test_id = ${testId}`
            );
        },
        getUpdateQuestions: (
            testId: number,
            questionIds?: number[],
            deleteQuestionIds?: number[]
        ): TUpdateDependentSql => {
            const updateAmount = `
                UPDATE tbl_tests AS t
                SET t.questions_amount = (SELECT COUNT(q.test_id)
                                          FROM tbl_questions_of_tests AS q
                                          WHERE q.test_id = ${testId})
                WHERE t.test_id = ${testId}`;
            const updateSql = questionIds && [
                TEST_SQL.createSql.getInsertQuestionsOfTests(testId, questionIds)
            ];
            const deleteSql
                = deleteQuestionIds
                && `
                  DELETE
                  FROM tbl_questions_of_tests
                  WHERE test_id = ${testId}
                    AND question_id IN (${deleteQuestionIds})`;

            return [updateSql, deleteSql, updateAmount];
        }
    },
    deleteSql: {
        getDeleteTests: (testIds: number[]): string => `
            DELETE
            FROM tbl_tests
            WHERE test_id IN (${testIds})`
    },
    interactSql: {
        getInsertUsersNeedTests: (usersNeedTests: TUserNeedTest[]): string => {
            const values = usersNeedTests.map((u) => `(${[u.testId, u.userId, u.projectId]})`);
            return `
                INSERT INTO tbl_users_need_tests(test_id, user_id, project_id)
                VALUES ${values}`;
        },
        getSelectUsersNeedTests: (usersNeedTests: TUserNeedTest): string => {
            const { userId, testId, projectId } = usersNeedTests;
            return `
                SELECT test_id        AS testId,
                       user_id        AS userId,
                       project_id     AS projectId,
                       state,
                       score,
                       date_started   AS dateStarted,
                       date_completed AS dateCompleted
                FROM tbl_users_need_tests
                WHERE user_id = ${userId}
                  AND test_id = ${testId}
                  AND project_id = ${projectId}
            `;
        },
        getUpdateUsersNeedTests: (
            completedTest: TUserNeedTest & Partial<TUsersNeedTests>
        ): string => {
            const { testId, userId, projectId, score, state, dateStarted, dateCompleted }
                = completedTest;
            const values = concat([
                dateCompleted ? "date_completed = '" + dateCompleted.trim() + "'" : '',
                dateStarted ? "date_started = '" + dateStarted.trim() + "'" : '',
                state ? "state = '" + state.trim() + "'" : '',
                score ? 'score = ' + score : ''
            ]);
            return (
                values
                && `
                  UPDATE tbl_users_need_tests
                  SET ${values}
                  WHERE user_id = ${userId}
                    AND test_id = ${testId}
                    AND project_id = ${projectId}
              `
            );
        },
        getDeleteUsersNeedTests: (userNeedTest: TUserNeedTest): string => {
            const { userId, testId, projectId } = userNeedTest;
            return `
                DELETE
                FROM tbl_users_need_tests
                WHERE project_id = ${projectId}
                  AND test_id = ${testId}
                  and user_id = ${userId}`;
        }
    }
};
