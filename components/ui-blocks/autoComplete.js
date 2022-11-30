import { Combobox, Transition } from '@headlessui/react';
import classNames from 'classnames';
import { Fragment } from 'react';

const people = [
  { id: 1, name: 'Wade Cooper' },
  { id: 2, name: 'Arlene Mccoy' },
  { id: 3, name: 'Devon Webb' },
  { id: 4, name: 'Tom Cook' },
  { id: 5, name: 'Tanya Fox' },
  { id: 6, name: 'Hellen Schmidt' },
]

export default function AutoComplete({
  options = [],
  query,
  setQuery = () => { },
  selected,
  setSelected,
  renderValue = () => { },
  renderOption = () => { },
  rootStyles,
  optionRootStyles,
  inputProps = {},
}) {
  const {className: inputClassName,...restInputProps} = inputProps;
  return (
      <Combobox value={selected} onChange={setSelected}>
      <div className={classNames("relative", rootStyles)}>
          <Combobox.Input
            className={classNames("w-full border-none py-2 pl-3 pr-10 text-sm leading-5 text-gray-900 focus:ring-0", inputClassName)}
            displayValue={renderValue}
            onChange={(event) => setQuery(event.target.value)}
            {...restInputProps}
          />
          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
            afterLeave={() => setQuery('')}
          >
          <Combobox.Options
            className={classNames(
              "absolute top-full mt-2 left-0 h-fit w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm",
              optionRootStyles
            )}
          >
              {options?.length === 0 && query !== '' ? (
                <div className="relative cursor-default select-none py-2 px-4 text-gray-700">
                  Nothing found.
                </div>
              ) : (
                options.map((option) => (
                  <Combobox.Option
                    key={option.id}
                    className={({ active }) =>
                      `relative cursor-default select-none py-2 pl-10 pr-4 text-black ${
                        active ? 'bg-slate-100' : 'bg-white'
                      }`
                    }
                    value={option}
                  >
                    {({ selected, active }) => (
                      renderOption(option, selected, active)
                    )}
                  </Combobox.Option>
                ))
              )}
            </Combobox.Options>
          </Transition>
        </div>
      </Combobox>
  )
}
