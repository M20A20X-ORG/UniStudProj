import { JSONSchemaType } from 'ajv';
import { TQuestionMarked } from '@type/schemas/tests/question';

export const questionMarkedSchema: JSONSchemaType<TQuestionMarked> = {
    $id: 'http://example.com/schemas/test/question/question-marked',
    type: 'object',
    properties: {
        questionId: { type: 'integer', minimum: 1 },
        optionIds: {
            type: 'array',
            items: { type: 'integer', minimum: 1 } as any,
            minItems: 0,
            maxItems: 50
        }
    },
    additionalProperties: false,
    required: ['questionId', 'optionIds']
};
