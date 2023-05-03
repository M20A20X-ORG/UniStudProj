import { JSONSchemaType } from 'ajv';
import { TNewsCreation, TNewsJson } from '@type/schemas/news';

type TCreationSchema = JSONSchemaType<TNewsJson<Array<TNewsCreation>>>;

export const creationSchema: TCreationSchema = {
    $id: 'http://example.com/schemas/news/creation',
    type: 'object',
    properties: {
        news: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    authorId: { type: 'integer', minimum: 1 },
                    heading: { type: 'string' },
                    text: { type: 'string' }
                },
                required: ['authorId', 'heading', 'text'],
                additionalProperties: false
            } as any,
            minItems: 1,
            maxItems: 50
        }
    },
    required: ['news'],
    additionalProperties: false
};
