import { TQuestion } from '@type/schemas/tests/question';
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

export type TTestsJson<T> = { tests: T };

export type TTestId = Pick<TTest, 'testId'>;
export type TTestCreation = Omit<TTest, 'questionsAmount' | 'testId' | 'questions'> &
    TProjectId & { questionIds: Array<number> };
export type TTestEdit = TTestId &
    TProjectId &
    Partial<TTestCreation> & { deleteQuestionIds?: Array<number> };
