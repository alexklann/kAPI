import { children, JSX, onMount, useContext } from "solid-js";
import { SelectContext } from "./index";

interface SelectOptionProps {
  children: JSX.Element,
  value: string
}

export default function SelectOption(props: SelectOptionProps) {
  const context = useContext(SelectContext);
  if (!context) throw new Error("SelectOption must be inside <Select>");
  const { registerOption, setSelectedValue, setOpen } = context;

  const resolved = children(() => props.children);

  onMount(() => {
    registerOption(props.value);
  })

  const handleClick = () => {
    setSelectedValue(props.value);
    setOpen(false);
  }

  return (
    <button onclick={handleClick} class="hover:bg-white/10 cursor-pointer py-1 px-2 rounded-md border border-transparent hover:border-white/20 transition-colors duration-100 ease-out">
      <span>{resolved()}</span>
    </button>
  )
}
