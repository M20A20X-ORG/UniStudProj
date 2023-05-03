import { JSONSchemaType } from 'ajv';
import { TOptionCreation, TOptionEdit } from '@type/schemas/tests/question';

type TOptionSchema = JSONSchemaType<TOptionCreation>;
type TOptionEditSchema = JSONSchemaType<TOptionEdit>;

export const optionSchema: TOptionSchema = {
    $id: 'http://example.com/schemas/test/question/option',
    type: 'object',
    properties: {
        text: { type: 'string' },
        imageUrl: { type: 'string', nullable: true }
    },
    additionalProperties: false,
    required: ['text']
};

export const optionSchemaEdit: TOptionEditSchema = {
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
