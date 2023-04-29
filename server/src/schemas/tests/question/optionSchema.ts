import { JSONSchemaType } from 'ajv';
import { TOption, TOptionEdit } from '@type/schemas/tests/question';

type projectParticipant = JSONSchemaType<TOption>;
type projectParticipantEdit = JSONSchemaType<TOptionEdit>;

export const optionSchema: projectParticipant = {
    $id: 'http://example.com/schemas/test/question/option',
    type: 'object',
    properties: {
        text: { type: 'string' },
        imageUrl: { type: 'string', nullable: true }
    },
    additionalProperties: false,
    required: ['text']
};

export const optionSchemaEdit: projectParticipantEdit = {
    $id: 'http://example.com/schemas/test/question/option-edit',
    type: 'object',
    properties: {
        optionId: { type: 'integer', minimum: 1 },
        text: { type: 'string', nullable: true },
        imageUrl: { type: 'string', nullable: true }
    },
    additionalProperties: false,
    required: ['optionId']
};
