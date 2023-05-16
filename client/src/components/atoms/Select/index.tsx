import React, { HTMLAttributes, JSX, ReactElement } from 'react';
import { TGetPropCallback } from 'utils/diffArrays';
import cn from 'classnames';

interface SelectProps<T> extends HTMLAttributes<HTMLSelectElement> {
    name?: string;
    data: {
        getId: TGetPropCallback<T, number>;
        getText: TGetPropCallback<T, string>;
        options: T[];
    };
}

export const Select = <T,>(props: SelectProps<T>): ReactElement => {
    const {
        data: { getId, getText, options },
        name,
        className,
        ...elemProps
    } = props;

    const renderOptions = (options: T[]) => {
        const optionElems: JSX.Element[] = options.map((option) => (
            <option
                key={JSON.stringify(option)}
                value={getId(option)}
            >
                {getText(option)}
            </option>
        ));
        return <>{optionElems}</>;
    };

    return (
        <span className={cn('select', className)}>
            <select
                name={name}
                {...elemProps}
            >
                {renderOptions(options)}
            </select>
        </span>
    );
};
