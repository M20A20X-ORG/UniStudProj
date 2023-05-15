import React, { FC, HTMLAttributes, JSX } from 'react';

interface SelectProps extends HTMLAttributes<HTMLSelectElement> {
    name: string;
    data: {
        getId: (option: object) => number;
        getText: (option: object) => string;
        options: object[]
    };
}

export const Select: FC<SelectProps> = (props) => {
    const {
        data: { getId, getText, options },
        name,
        ...elemProps
    } = props;

    const renderOptions = (options: object[]) => {
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
        <span className={'select'}>
            <select
                name={name}
                {...elemProps}
            >
                {renderOptions(options)}
            </select>
        </span>
    );
};
