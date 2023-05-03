import { JSONSchemaType } from 'ajv';
import { TNewsEdit, TNewsJson } from '@type/schemas/news';

type TEditSchema = JSONSchemaType<TNewsJson<Array<TNewsEdit>>>;

export const editSchema: TEditSchema = {
    $id: 'http://example.com/schemas/news/edit',
    type: 'object',
    properties: {
        news: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    newsId: { type: 'number', minimum: 0 },
                    authorId: { type: 'integer', minimum: 1, nullable: true },
                    heading: { type: 'string', nullable: true },
                    text: { type: 'string', nullable: true }
                },
                required: ['newsId'],
                additionalProperties: false
            } as any,
            minItems: 1,
            maxItems: 50
        }
    },
    required: ['news'],
    additionalProperties: false
};
