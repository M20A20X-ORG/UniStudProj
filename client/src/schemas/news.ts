import { JSONSchemaType } from 'ajv';
import { TNews } from 'types/rest/responses/news';

export const newsSchema: JSONSchemaType<TNews> = {
    $id: 'http://example.com/schema/news',
    type: 'object',
    properties: {
        newsId: { type: 'integer' },
        author: { type: 'string' },
        heading: { type: 'string' },
        text: { type: 'string' }
    },
    required: ['newsId', 'author', 'heading', 'text'],
    additionalProperties: false
};
