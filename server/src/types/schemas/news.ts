export type TNews = {
    newsId: number;
    author: string;
    heading: string;
    text: string;
};

export type TNewsJson<T> = { news: T };

export type TNewsId = Pick<TNews, 'newsId'>;
export type TNewsCreation = Omit<TNews, 'newsId' | 'author'> & { authorId: number };
export type TNewsEdit = TNewsId & Partial<TNewsCreation>;
