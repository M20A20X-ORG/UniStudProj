import React, { ChangeEvent, Dispatch, FC, HTMLAttributes, JSX, SetStateAction } from 'react';
import cn from 'classnames';
import s from './SelectMultiple.module.scss';

interface SelectProps extends HTMLAttributes<HTMLSelectElement> {
    name: string;
    data: {
        getId: (option: object) => number;
        getText: (option: object) => string;
        requireFindCallback: (id: number) => (option: object) => boolean;
        requireFilterCallback: (id: number) => (option: object) => boolean;
    };
    state: {
        optionsState: [object[] | null, Dispatch<SetStateAction<any[]>>];
        selectedState: [object[] | null, Dispatch<SetStateAction<any[]>>];
    };
}

export const Index: FC<SelectProps> = (props) => {
    const {
        data: { getId, getText, requireFindCallback, requireFilterCallback },
        state,
        name,
        onChange,
        ...elemProps
    } = props;

    /// ----- State ----- ///
    const [optionsState, setOptionsState] = state.optionsState;
    const [selectedState, setSelectedState] = state.selectedState;

    const removeSelected = (selectedOptions: object[], id: number): void => {
        setOptionsState((prev) => {
            const isExists = prev.find(requireFindCallback(id));
            if (isExists) return prev;
            const removed = selectedOptions.find(requireFindCallback(id));
            if (!removed) return prev;
            return [...prev, removed];
        });
        setSelectedState((prev) => prev.filter(requireFilterCallback(id)));
    };

    const handleOptionSelectChange = (options: object[], event: ChangeEvent<HTMLSelectElement>): void => {
        const id = +event.currentTarget.value;
        event.currentTarget.value = '';
        setSelectedState((prev) => {
            const isTagSelected = prev.find(requireFindCallback(id));
            if (isTagSelected) return prev;

            const selectedIndex = options.findIndex(requireFindCallback(id));
            const selected = options[selectedIndex];
            if (!selected) return prev;

            setOptionsState((prev) => [...prev.slice(0, selectedIndex), ...prev.slice(selectedIndex + 1)]);
            return [...prev, selected];
        });
    };

    const renderSelect = (options: object[] | null, selectedOptions: object[] | null) => {
        const selectedOptionElems: JSX.Element[] = !selectedOptions
            ? []
            : selectedOptions.map((option) => (
                  <li
                      key={JSON.stringify(option)}
                      className={cn('tag', s.selectedTag)}
                      onClick={() => {
                          selectedState && removeSelected(selectedState, getId(option));
                      }}
                  >
                      <span className={cn('clickable', 'btnClose', s.closeBtn)} />
                      <span>{getText(option)}</span>
                  </li>
              ));
        const availableOptionElems: JSX.Element[] = !options
            ? []
            : options.map((option) => (
                  <option
                      key={JSON.stringify(option)}
                      value={getId(option)}
                  >
                      {getText(option)}
                  </option>
              ));

        return (
            <span className={'select selectMultiple'}>
                <ul className={'selectMultipleList'}>{selectedOptionElems}</ul>
                <select
                    multiple
                    name={name}
                    onChange={(event) => {
                        onChange && onChange(event);
                        optionsState && handleOptionSelectChange(optionsState, event);
                    }}
                    {...elemProps}
                >
                    {availableOptionElems}
                </select>
            </span>
        );
    };

    return renderSelect(optionsState, selectedState);
};
