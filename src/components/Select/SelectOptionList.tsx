import { children, JSX, Show, useContext } from "solid-js";
import { SelectContext } from "./index";

interface SelectOptionProps {
  children: JSX.Element
}

export default function SelectOptionList(props: SelectOptionProps) {
  const context = useContext(SelectContext);
  if (!context) throw new Error("SelectOptionList must be inside <Select>");
  const { open } = context;

  const resolved = children(() => props.children);

  return (
    <Show when={open()}>
      <div class="absolute top-full left-0 mt-1 flex flex-col gap-1 bg-c-surface-0 border border-c-stroke rounded-lg">
        {resolved()}
      </div>
    </Show>
  )
}
