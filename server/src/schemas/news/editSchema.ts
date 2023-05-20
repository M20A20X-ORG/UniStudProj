import { JSONSchemaType } from 'ajv';
import { TNewsEdit, TNewsJson } from '@type/schemas/news';

type TEditSchema = JSONSchemaType<TNewsJson<TNewsEdit>>;

export const editSchema: TEditSchema = {
    $id: 'http://example.com/schemas/news/edit',
    type: 'object',
    properties: {
        news: {
            type: 'object',
            properties: {
                newsId: { type: 'number', minimum: 0 },
                authorId: { type: 'integer', minimum: 1, nullable: true },
                heading: { type: 'string', nullable: true },
                text: { type: 'string', nullable: true }
            },
            required: ['newsId'],
            additionalProperties: false
        }
    },
    required: ['news'],
    additionalProperties: false
};
