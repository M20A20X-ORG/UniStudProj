import { TQuestion, TQuestionMarked } from '@type/schemas/tests/question';
import { TProjectId } from '@type/schemas/projects/project';
import { TUserId } from '@type/schemas/user';

///// Schema /////
export type TTest<Q = TQuestion> = {
    testId: number;
    name: string;
    timeLimit: number;
    questionsAmount: number;
    dateStart: string;
    dateEnd: string;
    passingScore: number;
    questions: Array<Q>;
};

export type TTestsJson<T> = { tests: T };

export type TTestId = Pick<TTest, 'testId'>;
export type TTestCreation = Omit<TTest, 'questionsAmount' | 'testId' | 'questions'> &
    TProjectId & { questionIds: Array<number> };
export type TTestEdit = TTestId &
    Partial<Omit<TTestCreation, 'projectId'>> & { deleteQuestionIds?: Array<number> };

///// Interaction /////
export type TTestState = 'TEST_STARTED' | 'TEST_COMPLETED';

export type TUserNeedTest = TUserId & TTestId & TProjectId;
export type TUsersNeedTests = TUserNeedTest & {
    score: number;
    state: TTestState;
    dateStarted: string;
    dateCompleted: string;
};
export type TTestCompleted = TUserNeedTest & {
    answers: Array<TQuestionMarked>;
    dateCompleted: string;
};
