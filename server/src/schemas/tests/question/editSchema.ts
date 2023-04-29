import { JSONSchemaType } from 'ajv';
import { TQuestionEdit, TQuestionsJson } from '@type/schemas/tests/question';

type TEditSchema = JSONSchemaType<TQuestionsJson<TQuestionEdit[]>>;
type TEditPureSchema = JSONSchemaType<TQuestionEdit>;

export const editPureSchema: TEditPureSchema = {
    $id: 'http://example.com/schemas/test/question/edit-pure',
    type: 'object',
    properties: {
        questionId: { type: 'integer', minimum: 1 },
        typeId: { type: 'integer', minimum: 1, nullable: true },
        question: { type: 'string', nullable: true },
        options: {
            type: 'array',
            items: { $ref: '/schemas/test/question/option-edit' } as any,
            minItems: 0,
            maxItems: 50,
            nullable: true
        },
        result: { type: 'string', nullable: true },
        initValue: { type: 'string', nullable: true },
        progLangId: { type: 'integer', minimum: 1, nullable: true },
        regex: { type: 'string', nullable: true },
        regexGroup: { type: 'string', nullable: true },
        deleteOptionIds: {
            type: 'array',
            items: { type: 'integer', minimum: 1 } as any,
            minItems: 0,
            maxItems: 50,
            nullable: true
        }
    },
    additionalProperties: false,
    required: ['questionId']
};

export const editSchema: TEditSchema = {
    $id: 'http://example.com/schemas/test/question/edit',
    type: 'object',
    properties: {
        questions: {
            type: 'array',
            items: { $ref: '/schemas/test/question/edit-pure' } as any,
            minItems: 0,
            maxItems: 50
        }
    },
    additionalProperties: false,
    required: ['questions']
};
