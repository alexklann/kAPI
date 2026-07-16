import { useContext } from "solid-js";
import { SelectContext } from "./index";
import { twMerge } from "tailwind-merge";

interface SelectTriggerProps {
  class?: string;
}

export default function SelectTrigger(props: SelectTriggerProps) {
  const context = useContext(SelectContext);
  if (!context) throw new Error("SelectTrigger must be inside <Select>");
  const { selectedValue, setOpen, open } = context;

  const handleClick = () => {
    setOpen(!open());
  }

  return (
    <button onclick={handleClick} class={twMerge(
      "rounded-lg cursor-pointer font-bold text-2xl",
      props.class ?? ""
    )} type="button">
      <span>{selectedValue() || "Select..."}</span>
    </button>
  )
}
