import { onMount, Setter } from "solid-js";
import { MaybeNull, MaybeUndefined } from "../types/maybe";
import { twMerge } from "tailwind-merge";

interface AutoFocusInputProps {
  value: string;
  onblur: (newValue: string) => void;

  setEditingParameterRowId: Setter<MaybeNull<string>>;
  setEditingParameterType: Setter<MaybeNull<"key" | "value">>;

  class?: string;
}

export default function AutoFocusInput(props: AutoFocusInputProps) {
  let inputRef: MaybeUndefined<HTMLInputElement>;

  onMount(() => {
    inputRef?.focus();
    inputRef?.select();
  })

  const handleKeyDown = (e: KeyboardEvent) => {
    if (!inputRef) return;
    if (e.key === "Enter") {
      props.onblur(inputRef.value);
      props.setEditingParameterRowId(null);
      props.setEditingParameterType(null);
    }
  }

  const handleBlur = (_e: FocusEvent) => {
    if (!inputRef) return;
    props.onblur(inputRef.value);
    props.setEditingParameterRowId(null);
    props.setEditingParameterType(null);
  }

  return (
    <input
      ref={inputRef}
      onkeydown={handleKeyDown}
      onblur={handleBlur}
      class={twMerge("quick-center-y px-4 flex-1 border-r border-white/20", props.class)}
      value={props.value}
      autocapitalize="off"
      autocomplete="off"
      autocorrect="off"
    />
  )
}
