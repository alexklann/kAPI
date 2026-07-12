import { Accessor, createContext, createEffect, createSignal, JSX, Setter, splitProps } from "solid-js"

export interface SelectContextValue {
  selectedValue: Accessor<string>;
  setSelectedValue: (value: string) => void;
  open: Accessor<boolean>;
  setOpen: Setter<boolean>;
  registerOption: (value: string) => void;
}

export const SelectContext = createContext<SelectContextValue>();

interface SelectProps {
  children: JSX.Element;
  name: string;
  value?: string;
  onChange?: (value: string) => void;
}

export default function Select(props: SelectProps) {
  const [local, _] = splitProps(props, ["value", "onChange", "children", "name"]);
  const isControlled = () => local.value !== undefined;

  const [open, setOpen] = createSignal(false);
  const [internalValue, setInternalValue] = createSignal<string>("");
  const [options, setOptions] = createSignal<string[]>([]);

  const registerOption = (value: string) => {
    setOptions(prev => [...prev, value]);
  }

  const selectedValue = () => (isControlled() ? local.value! : internalValue());

  const setSelectedValue = (newValue: string) => {
      if (!isControlled()) {
        setInternalValue(newValue);
      }
      local.onChange?.(newValue);
    };

  // Set first value as default value of Select
  createEffect(() => {
    const opts = options();
    if (opts.length > 0 && !selectedValue()) {
      setSelectedValue(opts[0]);
      local.onChange?.(opts[0]);
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
