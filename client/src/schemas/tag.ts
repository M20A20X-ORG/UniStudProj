import { JSONSchemaType } from 'ajv';
import { TTag } from 'types/rest/responses/tag';

export const tagSchema: JSONSchemaType<TTag> = {
    $id: 'http://example.com/schema/tag',
    type: 'object',
    properties: {
        tagId: { type: 'integer' },
        tag: { type: 'string' }
    },
    additionalProperties: false,
    required: ['tagId', 'tag']
};
