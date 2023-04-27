import { JSONSchemaType } from 'ajv';
import { TOption } from '@type/schemas/tests/question';

type projectParticipantId = JSONSchemaType<TOption>;
export const optionSchema: projectParticipantId = {
    $id: 'http://example.com/schemas/test/question/option',
    type: 'object',
    properties: {
        text: { type: 'string' },
        imageUrl: { type: 'string', nullable: true }
    },
    additionalProperties: false,
    required: ['text']
};
