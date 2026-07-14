import { createSignal, createUniqueId, For, Match, Show, Switch } from "solid-js";
import "./App.css";
import { logger } from "./util/logger";
import { invoke } from "@tauri-apps/api/core";
import Select from "./components/Select";
import SelectOption from "./components/Select/SelectOption";
import SelectOptionList from "./components/Select/SelectOptionList";
import SelectTrigger from "./components/Select/SelectTrigger";
import DOMPurify from "dompurify";
import { MaybeNull } from "./types/maybe";
import KeyValuePair from "./types/keyValuePair";
import ParameterTableRow from "./components/ParametersTable/ParameterTableRow";

enum FetchState {
  IDLE,
  FETCHING
}

interface APIResponse {
  method: string,
  content_type: string,
  text: string,
}

function App() {
  const [selectedMethod, setSelectedMethod] = createSignal("GET");
  const [apiResponse, setApiResponse] = createSignal<MaybeNull<APIResponse>>(null);
  const [fetchState, setFetchState] = createSignal<FetchState>(FetchState.IDLE);

  const [requestParams, setRequestParams] = createSignal<KeyValuePair[]>([{ id: createUniqueId(), key: "", value: "" }])

  const [editingParameterRowId, setEditingParameterRowId] = createSignal<MaybeNull<string>>(null);
  const [editingParameterType, setEditingParameterType] = createSignal<MaybeNull<"key" | "value">>(null);

  const methodColors: Record<string, string> = {
    "GET": "text-green-500",
    "POST": "text-yellow-500"
  }

  const handleURLFormSubmit = async (event: SubmitEvent) => {
    event.preventDefault();

    setFetchState(FetchState.FETCHING);

    const form = event.currentTarget as HTMLFormElement;
    const data = new FormData(form);

    const method = data.get("method")
    const url = data.get("url")

    if (!method || !url) {
      logger.error("Method or URL is null!");
      logger.debug(`Error details: method=${method};url=${url}`);
      return;
    }

    const response = await invoke("send_api_request", {
      method: method,
      url: url,
      params: requestParams
    }) as APIResponse;

    setApiResponse(response);
    setFetchState(FetchState.IDLE);
  }

  return (
    <main class="h-screen w-screen flex flex-col justify-start items-center gap-4 m-0 p-6">
      <h1 class="text-2xl font-bold">kAPI</h1>

      <div class="flex flex-col h-full w-full gap-2">
        <form onsubmit={handleURLFormSubmit} class="flex flex-row gap-2 p-2 rounded-lg border-2 border-white/20">
          <Select name="method" value={selectedMethod()} onChange={setSelectedMethod}>
            <SelectTrigger class={methodColors[selectedMethod()]} />
            <SelectOptionList>
              <SelectOption value="GET" class={methodColors["GET"]}>GET</SelectOption>
              <SelectOption value="POST" class={methodColors["POST"]}>POST</SelectOption>
            </SelectOptionList>
          </Select>
          <input name="url" type="url" required placeholder="https://example.com/" class="p-1 border border-white/20 rounded-lg flex-1" />
          <Show when={fetchState() === FetchState.IDLE}>
            <button title="Send API request" class="bg-blue-600 text-white px-2 py-1 rounded-lg cursor-pointer hover:bg-blue-500" type="submit">Send</button>
          </Show>
          <Show when={fetchState() === FetchState.FETCHING}>
            <button title="Send API request" class="bg-blue-600 text-white px-2 py-1 rounded-lg cursor-pointer hover:bg-blue-500 disabled:bg-blue-700" type="submit" disabled>Fetching...</button>
          </Show>
        </form>
        <div class="flex flex-row gap-2 h-full">
          <div class="flex flex-col flex-1 border border-white/20 rounded-lg">
            <div class="flex flex-row w-full border-b border-white/20 min-h-10 bg-white/10 font-bold">
              <span class="flex justify-center items-center flex-1 border-r border-white/20">Key</span>
              <span class="flex justify-center items-center flex-1 ">Value</span>
            </div>
            <Show when={Object.keys(requestParams() ?? {}).length > 0}>
              <For each={requestParams()}>
                {(pair, _) => (
                  <ParameterTableRow
                    pair={pair}

                    editingParameterRowId={editingParameterRowId}
                    setEditingParameterRowId={setEditingParameterRowId}
                    editingParameterType={editingParameterType}
                    setEditingParameterType={setEditingParameterType}

                    requestParams={requestParams}
                    setRequestParams={setRequestParams}
                  />
                )}
              </For>
            </Show>
          </div>
          <Show when={apiResponse() !== null} fallback={<div class="p-2 bg-white/10 rounded-lg h-full flex-1"></div>}>
            <Switch>
              <Match when={apiResponse()?.content_type === "application/json"}>
                <div class="p-2 bg-white/10 rounded-lg h-full flex-1 overflow-y-scroll">
                  <p>{apiResponse()?.text}</p>
                </div>
              </Match>
              <Match when={apiResponse()?.content_type === "text/html"}>
                <div class="p-2 bg-white/10 rounded-lg h-full flex-1 overflow-y-scroll" innerHTML={DOMPurify.sanitize(apiResponse()?.text ?? "")}></div>
              </Match>
            </Switch>
          </Show>
        </div>
      </div>
    </main>
  );
}

export default App;
