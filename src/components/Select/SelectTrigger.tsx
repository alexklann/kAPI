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
      "px-2 py-1 border-2 border-white/20 rounded-lg cursor-pointer hover:bg-white/10 font-bold",
      props.class ?? ""
    )} type="button">
      <span>{selectedValue() || "Select..."}</span>
    </button>
  )
}
