import { TNews } from "types/rest/responses/news";

export type TNewsJson<T> = { news: T };

export type TNewsId = Pick<TNews, 'newsId'>;
export type TNewsCreation = Omit<TNews, 'newsId' | 'author'> & { authorId: number };
export type TNewsEdit = TNewsId & Partial<TNewsCreation>;
