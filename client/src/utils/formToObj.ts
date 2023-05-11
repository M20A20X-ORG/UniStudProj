import { MutableRefObject } from 'react';

export const formToObj = <T>(formRef: MutableRefObject<HTMLFormElement>): T =>
    Object.fromEntries(new FormData(formRef.current)) as T;
