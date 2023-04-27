export type TOption = {
    text: string;
    imageUrl?: string;
};

export type TQuestion = {
    questionId: number;
    type: string;
    result: string;
    progLang?: string;
    question: string;
    initValue?: string;
    regexGroup?: string;
    regex?: string;
    options: Array<TOption>;
};

export type TQuestionsJson<T> = { questions: T };

export type TQuestionId = Pick<TQuestion, 'questionId'>;
export type TQuestionCreation = Omit<TQuestion, 'questionId' | 'type' | 'progLang'> & {
    typeId: number;
    progLangId?: number;
};
export type TQuestionEdit = TQuestionId &
    Partial<TQuestionCreation & { deleteOptionIds: Array<number> }>;
