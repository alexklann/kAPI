import { Accessor, createContext, createEffect, createSignal, JSX, Setter } from "solid-js"

export interface SelectContextValue {
  selectedValue: Accessor<string>;
  setSelectedValue: Setter<string>;
  open: Accessor<boolean>;
  setOpen: Setter<boolean>;
  registerOption: (value: string) => void;
}

export const SelectContext = createContext<SelectContextValue>();

interface SelectProps {
  children: JSX.Element;
  name: string;
}

export default function Select(props: SelectProps) {
  const [open, setOpen] = createSignal(false);
  const [selectedValue, setSelectedValue] = createSignal<string>("");
  const [options, setOptions] = createSignal<string[]>([]);

  const registerOption = (value: string) => {
    setOptions(prev => [...prev, value]);
  }

  // Set first value as default value of Select
  createEffect(() => {
    const opts = options();
    if (opts.length > 0 && !selectedValue()) {
      setSelectedValue(opts[0]);
    }
  });

  const context: SelectContextValue = {
    selectedValue,
    setSelectedValue,
    open,
    setOpen,
    registerOption
  }

  // The hidden <input> tag used below allows the parent <form> tag
  // to see this custom Select component as a "normal" <input> tag
  // and serialize it for a SubmitEvent.
  return (
    <SelectContext.Provider value={context}>
      <div class="relative">
        <input type="hidden" name={props.name} value={selectedValue()} />
        {props.children}
      </div>
    </SelectContext.Provider>
  )
}
