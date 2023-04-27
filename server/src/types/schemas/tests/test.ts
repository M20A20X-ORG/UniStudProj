import { TQuestion, TQuestionEdit } from '@type/schemas/tests/question';
import { TProjectId } from '@type/schemas/projects/project';

export type TTest = {
    testId: number;
    name: string;
    timeLimit: number;
    questionsAmount: number;
    dateStart: string;
    dateEnd: string;
    questions: Array<TQuestion>;
};

export type TTestJson<T> = { test: T };

export type TTestId = Pick<TTest, 'testId'>;
export type TTestCreation = Omit<TTest, 'questionsAmount' | 'testId' | 'questions'> &
    TProjectId & {
        questionId?: Array<number>;
        newQuestions?: Array<TQuestion>;
    };
export type TTestEdit = TTestId &
    TProjectId &
    Partial<
        TTestCreation & {
            editedQuestions: Array<TQuestionEdit>;
            deleteQuestionIds: Array<number>;
        }
    >;
