import { MutableRefObject } from 'react';

export const formToObj = (formRef: MutableRefObject<HTMLFormElement>) =>
    Object.fromEntries(new FormData(formRef.current));
