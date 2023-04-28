import { TOption, TQuestionCreation } from '@type/schemas/tests/question';

export const QUESTION_SQL = {
    deleteSql: {
        getDeleteQuestions: (questionIds: number[]) => `
        DELETE
        FROM tbl_questions
        WHERE question_id IN (${questionIds})`
    },
    createSql: {
        getInsertQuestionsCommon: (questionsCommonData: Omit<TQuestionCreation, 'options'>) => {
            const q = questionsCommonData;
            const value = `(${q.typeId},${q.progLangId},'${q.result}','${q.question}','${q.initValue}','${q.regexGroup}','${q.regex}')`;
            return `
          INSERT INTO tbl_questions(type_id, prog_lang_id, result, question, init_value, regex_group, regex)
          VALUES ${value}`;
        },
        getInsertQuestionOptions: (questionId: number, optionsData: TOption[]) => {
            const values = optionsData.map((o) => `(${questionId},'${o.text}','${o.imageUrl}')`);
            return `
          INSERT INTO tbl_question_options(question_id, text, image_url)
          VALUES ${values}`;
        }
    }
};
