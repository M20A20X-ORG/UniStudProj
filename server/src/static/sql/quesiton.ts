import {
    TOption,
    TOptionEdit,
    TQuestionCreation,
    TQuestionEdit
} from '@type/schemas/tests/question';
import { concat } from '@utils/concat';
import { TUpdateDependentSql } from '@type/sql';

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
    },
    readSql: {
        selectQuestion: `
            SELECT q.question_id AS questionId,
                   q.init_value  AS initValue,
                   q.regex_group AS regexGroup,
                   qt.name       AS type,
                   qp.name       AS prohLang,
                   q.result,
                   q.question,
                   q.regex
            FROM (SELECT question_id,
                         type_id,
                         result,
                         prog_lang_id,
                         question,
                         init_value,
                         regex_group,
                         regex
                  FROM tbl_questions
                  WHERE question_id = ?) AS q
                     JOIN tbl_question_types qt ON qt.type_id = q.type_id
                     JOIN tbl_question_prog_langs qp ON qp.prog_lang_id = q.prog_lang_id`,
        selectQuestionOptions: `
            SELECT text, image_url AS imageUrl
            FROM tbl_question_options`
    },
    updateSql: {
        getUpdateQuestionCommon: (
            questionData: Omit<TQuestionEdit, 'options' | 'deleteOptionIds'>
        ) => {
            const {
                questionId,
                question,
                typeId,
                regexGroup,
                regex,
                result,
                progLangId,
                initValue
            } = questionData;

            const vales = concat([
                typeId ? 'type_id = ' + typeId : '',
                progLangId ? 'prog_lang_id = ' + progLangId : '',
                regexGroup !== undefined ? "regex_group = '" + regexGroup.trim() + "'" : '',
                regex !== undefined ? "regex = '" + regex.trim() + "'" : '',
                initValue !== undefined ? "init_value = '" + initValue.trim() + "'" : '',
                result ? "result = '" + result.trim() + "'" : '',
                question ? "question = '" + question.trim() + "'" : ''
            ]);

            return (
                vales &&
                `
                  UPDATE tbl_questions
                  SET ${vales}
                  WHERE question_id = ${questionId}`
            );
        },
        getUpdateOptions: (
            questionId: number,
            optionsData: TOptionEdit[] | undefined,
            deleteOptionIds: number[] | undefined
        ): TUpdateDependentSql => {
            const updateSql =
                optionsData &&
                optionsData.map((o) => {
                    const { optionId, text, imageUrl } = o;

                    const values = concat([
                        text !== undefined ? "text = '" + text.trim() + "'" : '',
                        imageUrl !== undefined ? "image_url = '" + imageUrl.trim() + "'" : ''
                    ]);

                    return (
                        values &&
                        `
                        UPDATE tbl_question_options
                        SET ${values}
                        WHERE option_id = ${optionId}`
                    );
                });

            const deleteSql =
                deleteOptionIds &&
                `
                  DELETE
                  FROM tbl_question_options
                  WHERE option_id IN (${deleteOptionIds})`;

            return [updateSql, deleteSql];
        }
    }
};
