import { JSONSchemaType } from 'ajv';
import { TNewsCreation, TNewsJson } from '@type/schemas/news';

type TCreationSchema = JSONSchemaType<TNewsJson<TNewsCreation>>;

export const creationSchema: TCreationSchema = {
    $id: 'http://example.com/schemas/news/creation',
    type: 'object',
    properties: {
        news: {
            type: 'object',
            properties: {
                authorId: { type: 'integer', minimum: 1 },
                heading: { type: 'string' },
                text: { type: 'string' }
            },
            required: ['authorId', 'heading', 'text'],
            additionalProperties: false
        }
    },
    required: ['news'],
    additionalProperties: false
};
