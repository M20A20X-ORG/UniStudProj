export type TOption = {
    optionId: number;
    text: string;
    imageUrl?: string;
};

export type TOptionId = Pick<TOption, 'optionId'>;
export type TOptionCreation = Omit<TOption, 'optionId'>;
export type TOptionEdit = TOptionId & Partial<TOption>;

export type TQuestion = {
    questionId: number;
    type: string;
    result: Array<TOption>;
    progLang?: string;
    question: string;
    initValue?: string;
    regexGroup?: string;
    regex?: string;
    options: Array<TOption>;
    score: number;
};
export type TQuestionPublic = Omit<TQuestion, 'result'>;

export type TQuestionsJson<T> = { questions: T };

export type TQuestionId = Pick<TQuestion, 'questionId'>;
export type TQuestionCreation = Omit<
    TQuestion,
    'questionId' | 'type' | 'progLang' | 'result' | 'options'
> & {
    options: Array<TOptionCreation>;
    results: Array<TOptionCreation>;
    typeId: number;
    progLangId?: number;
};
export type TQuestionEdit = TQuestionId &
    Partial<
        Omit<TQuestionCreation, 'options' | 'results'> & {
            deleteOptionIds: Array<number>;
            options: Array<TOptionEdit>;
            resultIds: Array<number>;
        }
    >;

///// Interaction /////
export type TQuestionMarked = {
    questionId: number;
    optionIds: number[];
};
