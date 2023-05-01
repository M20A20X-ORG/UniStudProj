import { TTest, TTestCreation, TTestEdit } from '@type/schemas/tests/test';
import { LIMIT_DEFAULT } from '@static/sql/common';
import { concat } from '@utils/concat';
import { TUpdateDependentSql } from '@type/sql';

type TQuestionCommon = Omit<TTestCreation, 'questionIds' | 'newQuestions'> &
    Pick<TTest, 'questionsAmount'>;

export const TEST_SQL = {
    createSql: {
        getInsertTestCommon: (testsCommonData: TQuestionCommon): string => {
            const t = testsCommonData;
            const value = `('${t.name}',${t.timeLimit},${t.questionsAmount},'${t.dateStart}','${t.dateEnd}')`;
            return `
          INSERT INTO tbl_tests(name, time_limit, questions_amount, date_start, date_end)
          VALUES ${value}`;
        },
        getInsertQuestionsOfTests: (testId: number, questionIds: number[]): string => {
            const values = questionIds.map((id) => `(${testId},${id})`);
            return `
          INSERT INTO tbl_questions_of_tests(test_id, question_id)
          VALUES ${values}`;
        }
    },
    deleteSql: {
        getDeleteTests: (testIds: number[]) => `
        DELETE
        FROM tbl_tests
        WHERE test_id IN (${testIds})`
    },
    readSql: {
        selectTest: `
        SELECT test_id          AS testId,
               name,
               time_limit       AS timeLimit,
               questions_amount AS questionsAmount,
               date_start       AS dateStart,
               date_end         AS dateEnd
        FROM tbl_tests
        WHERE test_id = ?`,
        selectTop10Test: `
        SELECT test_id          AS testId,
               name,
               time_limit       AS timeLimit,
               questions_amount AS questionsAmount,
               date_start       AS dateStart,
               date_end         AS dateEnd
        FROM tbl_tests
        LIMIT ${LIMIT_DEFAULT}`,
        selectQuestionIds: `
        SELECT test_id AS testId, question_id AS questionId
        FROM tbl_questions_of_tests
        WHERE test_id = ?`
    },
    updateSql: {
        getUpdateTestCommon: (
            testData: Omit<TTestEdit, 'questionIds' | 'projectId' | 'deleteQuestionIds'>
        ) => {
            const { testId, name, timeLimit, dateStart, dateEnd } = testData;

            const vales = concat([
                name ? "name = '" + name.trim() + "'" : '',
                timeLimit ? 'time_limit = ' + timeLimit : '',
                dateStart ? "date_start = '" + dateStart.trim() + "'" : '',
                dateEnd ? "date_end = '" + dateEnd.trim() + "'" : ''
            ]);

            return (
                vales &&
                `
            UPDATE tbl_tests
            SET ${vales}
            WHERE test_id = ${testId}`
            );
        },
        getUpdateQuestions: (
            testId: number,
            questionIds: number[] | undefined,
            deleteQuestionIds: number[] | undefined
        ): TUpdateDependentSql => {
            const updateAmount = `UPDATE tbl_tests AS t
                            SET t.questions_amount = (SELECT COUNT(q.test_id)
                                                      FROM tbl_questions_of_tests AS q
                                                      WHERE q.test_id = ${testId})
                            WHERE t.test_id = ${testId}`;

            const updateSql = questionIds && [
                TEST_SQL.createSql.getInsertQuestionsOfTests(testId, questionIds)
            ];

            const deleteSql =
                deleteQuestionIds &&
                `
            DELETE
            FROM tbl_questions_of_tests
            WHERE test_id = ${testId}
              AND question_id IN (${deleteQuestionIds})`;

            return [updateSql, deleteSql, updateAmount];
        }
    }
};
