import { useContext } from "solid-js";
import { SelectContext } from "./index";

export default function SelectTrigger() {
  const context = useContext(SelectContext);
  if (!context) throw new Error("SelectTrigger must be inside <Select>");
  const { selectedValue, setOpen, open } = context;

  const handleClick = () => {
    setOpen(!open());
  }

  return (
    <button onclick={handleClick} class="px-2 py-1 border-2 border-white/20 rounded-lg cursor-pointer hover:bg-white/10" type="button">
      <span>{selectedValue() || "Select..."}</span>
    </button>
  )
}
