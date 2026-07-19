import { Accessor, createUniqueId, Match, Setter, Show, Switch } from "solid-js";
import KeyValuePair from "../../types/keyValuePair";
import AutoFocusInput from "../AutoFocusInput";
import { MaybeNull } from "../../types/maybe";
import { stringEmpty } from "../../util/helpers";

interface ParameterTableRowProps {
  pair: KeyValuePair,

  editingParameterRowId: Accessor<MaybeNull<string>>;
  setEditingParameterRowId: Setter<MaybeNull<string>>;
  editingParameterType: Accessor<MaybeNull<"key" | "value">>;
  setEditingParameterType: Setter<MaybeNull<"key" | "value">>;

  requestParams: Accessor<KeyValuePair[]>;
  setRequestParams: Setter<KeyValuePair[]>;

  onChange: (valuePair: KeyValuePair) => void;
}

export default function ParameterTableRow(props: ParameterTableRowProps) {
  const rowId = createUniqueId();
  const pair = props.pair;

  const createNewArrayEntry = (newType: "key" | "value", newValue: string) => {
    const arrayIndex = props.requestParams().findIndex((p) => p.key === pair.key);
    const current = props.requestParams()[arrayIndex];

    const updatedPair: KeyValuePair = {
       ...current,
       [newType]: newValue,
     };

    let tempArray = [...props.requestParams()];
    tempArray[arrayIndex] = updatedPair;

    const lastIndex = tempArray.length-1;

    // Only add new row if both fields are non-empty
    // and there isn't already an empty row in the array.
    if (
      !stringEmpty(updatedPair.key) && !stringEmpty(updatedPair.value) &&
      !stringEmpty(tempArray[lastIndex].key) && !stringEmpty(tempArray[lastIndex].value)
    ) {
      tempArray.push({ id: createUniqueId(), key: "", value: "" });
    }

    props.setRequestParams(tempArray);
    props.onChange(updatedPair);
  }

  return (
    <div class="flex flex-row w-full border-b border-white/20 min-h-10 odd:bg-white/10">
      <Switch>
        {/* No Editing; Display contents */}
        <Match when={props.editingParameterRowId() !== rowId}>
          <span
            onclick={() => {
              props.setEditingParameterRowId(rowId);
              props.setEditingParameterType("key");
            }}
            class={`px-4 quick-center-y flex-1 border-r border-white/20 cursor-pointer ${!stringEmpty(pair.key) ? "" : "text-white/40"}`}>
            {!stringEmpty(pair.key) ? pair.key : "Key"}
          </span>

          <span
            onclick={() => {
              props.setEditingParameterRowId(rowId);
              props.setEditingParameterType("value");
            }}
            class={`px-4 quick-center-y flex-1 border-r border-white/20 cursor-pointer ${!stringEmpty(pair.value) ? "" : "text-white/40"}`}>
            {!stringEmpty(pair.value) ? pair.value : "Value"}
          </span>
        </Match>

        {/* Editing Key of Row */}
        <Match when={props.editingParameterType() === "key"}>
          <AutoFocusInput
            value={pair.key}
            onblur={(newKey) => { createNewArrayEntry("key", newKey )}} setEditingParameterRowId={props.setEditingParameterRowId} setEditingParameterType={props.editingParameterType}
          />

          <span
            onclick={() => {
              props.setEditingParameterRowId(rowId);
              props.setEditingParameterType("value");
            }}
            class={`px-4 quick-center-y flex-1 border-r border-white/20 cursor-pointer ${!stringEmpty(pair.value) ? "" : "text-white/40"}`}>
            {!stringEmpty(pair.value) ? pair.value : "Value"}
          </span>
        </Match>

        {/* Editing Value of Row */}
        <Match when={props.editingParameterType() === "value"}>
          <span
            onclick={() => {
              props.setEditingParameterRowId(rowId);
              props.setEditingParameterType("key");
            }}
            class={`px-4 quick-center-y flex-1 border-r border-white/20 cursor-pointer ${!stringEmpty(pair.key) ? "" : "text-white/40"}`}>
            {!stringEmpty(pair.key) ? pair.key : "Key"}
          </span>

          <AutoFocusInput value={pair.value} onblur={(newValue) => { createNewArrayEntry("value", newValue) }}
          setEditingParameterRowId={props.setEditingParameterRowId} setEditingParameterType={props.editingParameterType}
          />
        </Match>
      </Switch>
    </div>
  )
}
