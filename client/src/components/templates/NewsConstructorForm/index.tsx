import React, { FC, MouseEvent, useRef } from 'react';
import { formToObj } from 'utils/formToObj';
import { TNewsCreation } from 'types/rest/requests/news';

export type TNewsFormData = TNewsCreation;

interface NewsConstructorFormProps {
    handleFormSubmit: (formData: TNewsFormData) => Promise<void>;
    actionType: 'create' | 'edit';
    initData?: TNewsFormData;
}

export const NewsConstructorForm: FC<NewsConstructorFormProps> = (props) => {
    const { actionType, handleFormSubmit, initData } = props;
    const isCreationAction = actionType === 'create';

    /// ----- Context / Ref ----- ///
    const formRef = useRef<HTMLFormElement>(document.createElement('form'));

    /// ----- Handlers ----- ///
    const handleFormPreSubmit = async (event: MouseEvent<HTMLButtonElement>): Promise<void> => {
        event.preventDefault();
        const formDataFilled = formToObj<TNewsFormData>(formRef);
        await handleFormSubmit(formDataFilled);
    };

    return (
        <>
            <form ref={formRef}>
                <fieldset className={'fieldset'}>
                    <input
                        type={'text'}
                        name={'heading'}
                        placeholder={'Heading:'}
                        defaultValue={initData?.heading}
                        required={isCreationAction}
                    />
                    <textarea
                        name={'text'}
                        placeholder={'Text:'}
                        defaultValue={initData?.text}
                        required={isCreationAction}
                    />
                </fieldset>
                <button
                    type={'submit'}
                    className={'btn clickable'}
                    onClick={handleFormPreSubmit}
                >
                    {isCreationAction ? 'Create' : 'Save changes'}
                </button>
            </form>
        </>
    );
};
