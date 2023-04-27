import { JSONSchemaType } from 'ajv';
import { TQuestionCreation, TQuestionsJson } from '@type/schemas/tests/question';

type TCreationPureSchema = JSONSchemaType<TQuestionCreation>;
type TCreationSchema = JSONSchemaType<TQuestionsJson<TQuestionCreation[]>>;

export const creationPureSchema: TCreationPureSchema = {
    $id: 'http://example.com/schemas/test/question/creation-pure',
    type: 'object',
    properties: {
        typeId: { type: 'integer', minimum: 1 },
        question: { type: 'string' },
        options: {
            type: 'array',
            items: { $ref: '/schemas/test/question/option' } as any,
            minItems: 0,
            maxItems: 50
        },
        result: { type: 'string' },
        initValue: { type: 'string', nullable: true },
        progLangId: { type: 'integer', minimum: 1, nullable: true },
        regex: { type: 'string', nullable: true },
        regexGroup: { type: 'string', nullable: true }
    },
    additionalProperties: false,
    required: ['typeId', 'question', 'options', 'result']
};

export const creationSchema: TCreationSchema = {
    $id: 'http://example.com/schemas/test/question/creation',
    type: 'object',
    properties: {
        questions: {
            type: 'array',
            items: { $ref: '/schemas/test/question/creation-pure' } as any,
            minItems: 0,
            maxItems: 50
        }
    },
    additionalProperties: false,
    required: ['questions']
};
