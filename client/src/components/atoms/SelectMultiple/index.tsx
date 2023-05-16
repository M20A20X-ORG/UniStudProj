import React, {
    ChangeEvent,
    Dispatch,
    FC,
    HTMLAttributes,
    JSX,
    PropsWithChildren,
    ReactElement,
    SetStateAction,
    useEffect,
    useRef
} from 'react';

import cn from 'classnames';
import { diffArrays, TGetPropCallback } from 'utils/diffArrays';

import s from './SelectMultiple.module.scss';

interface SelectProps<T> extends HTMLAttributes<HTMLSelectElement> {
    name?: string;
    data: {
        getId: TGetPropCallback<T, number>;
        getText: TGetPropCallback<T, string>;
        getDefaultValue?: TGetPropCallback<T, number>;
    };
    state: {
        optionsState: [T[], Dispatch<SetStateAction<T[]>>];
        selectedState: [T[], Dispatch<SetStateAction<T[]>>];
    };
    classNames?: {
        list?: string;
        listElem?: string;
    };
    requireInnerLogic?: (optionId: number, defaultValue?: number) => JSX.Element;
}

export const SelectMultiple = <T,>(props: SelectProps<T>): ReactElement => {
    const {
        data: { getId, getText, getDefaultValue },
        state,
        name,
        onChange,
        classNames,
        requireInnerLogic,
        ...elemProps
    } = props;

    /// ----- State / Ref ----- ///
    const [optionsState, setOptionsState] = state.optionsState;
    const [selectedState, setSelectedState] = state.selectedState;
    const isOptionsFiltered = useRef(false);

    function removeSelected(selectedOptions: T[], id: number): void {
        setOptionsState((prev) => {
            const isExists = prev.find((o) => getId(o) === id);
            if (isExists) return prev;
            const removed = selectedOptions.find((so) => getId(so) === id);
            if (!removed) return prev;
            return [...prev, removed];
        });
        setSelectedState((prev) => prev.filter((so) => getId(so) !== id));
    }

    function handleOptionSelectChange(options: T[], event: ChangeEvent<HTMLSelectElement>): void {
        const id = +event.currentTarget.value;
        event.currentTarget.value = '';
        setSelectedState((prev) => {
            const isTagSelected = prev.find((o) => getId(o) === id);
            if (isTagSelected) return prev;

            const selectedIndex = options.findIndex((o) => getId(o) === id);
            const selected = options[selectedIndex];
            if (!selected) return prev;

            setOptionsState((prev) => [...prev.slice(0, selectedIndex), ...prev.slice(selectedIndex + 1)]);
            return [...prev, selected];
        });
    }

    useEffect(() => {
        if (!optionsState.length || isOptionsFiltered.current) return;
        setOptionsState((prev) => diffArrays([prev, getId], [selectedState, getId]));
        isOptionsFiltered.current = true;
    }, [optionsState]);

    function renderSelect(options: T[] | null, selectedOptions: T[] | null) {
        const selectedOptionElems: JSX.Element[] = !selectedOptions
            ? []
            : selectedOptions.map((option) => {
                  const innerSelectElem = requireInnerLogic?.(
                      getId(option),
                      getDefaultValue ? getDefaultValue(option) : undefined
                  );
                  return (
                      <li
                          key={JSON.stringify(option)}
                          className={cn('tag', s.selectedTag, classNames?.listElem)}
                      >
                          <span
                              className={cn('clickable', 'btnClose', s.closeBtn)}
                              onClick={() => {
                                  selectedState && removeSelected(selectedState, getId(option));
                              }}
                          />
                          <span>{getText(option)}</span>
                          <span>{innerSelectElem}</span>
                      </li>
                  );
              });
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
                <ul className={cn('selectMultipleList', classNames?.list)}>{selectedOptionElems}</ul>
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
    }

    return renderSelect(optionsState, selectedState);
};
