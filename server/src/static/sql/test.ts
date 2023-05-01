import { TTest, TTestCreation } from '@type/schemas/tests/test';

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
    }
};
