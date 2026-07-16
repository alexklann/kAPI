import { createEffect, createSignal, createUniqueId, For, Match, Show, Switch } from "solid-js";
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
import { stringEmpty } from "./util/helpers";
import SendIcon from "./icons/SendIcon";
import SpinnerIcon from "./icons/SpinnerIcon";

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

  const [urlInput, setUrlInput] = createSignal<string>("");
  const [parameterizedUrl, setParameterizedUrl] = createSignal<string>("");

  const methodColors: Record<string, string> = {
    "GET": "text-c-signal-green-100",
    "POST": "text-yellow-500"
  }

  const sendAPIRequest = async () => {
    setFetchState(FetchState.FETCHING);

    const method = selectedMethod();
    const url = urlInput();

    if (!method || !url) {
      logger.error("Method or URL is null!");
      logger.debug(`Error details: method=${method};url=${url}`);
      return;
    }

    const response = await invoke("send_api_request", {
      method: method,
      url: url,
      params: requestParams()
    }) as APIResponse;

    setApiResponse(response);
    setFetchState(FetchState.IDLE);
  }

  /**
   * Parses the URL parameters from the urlInput() and populates
   * the requestParams signal with the converted pairs.
   */
  const parseURLParameters = () => {
    try {
      const url = new URL(urlInput());
      const params: KeyValuePair[] = [];

      url.searchParams.forEach((value, key) => {
        params.push({ id: createUniqueId(), key, value });
      })
      if (params.length > 0) setRequestParams(params);
    } catch {
      console.error("The URL does not seem to be valid.");
    }
  }

  createEffect(() => {
    let tempUrl = urlInput();
    let parameters = requestParams();

    // If there are no entries in the table (empty table still HAS one value!!!)
    if (parameters.length === 1 && stringEmpty(parameters[0].key) && stringEmpty(parameters[0].value)) {
      setParameterizedUrl(tempUrl);
      return;
    }

    for (let i = 0; i < parameters.length; i++) {
      // If the row is completely empty.
      if (stringEmpty(parameters[i].key) && stringEmpty(parameters[i].value)) continue;
      // If the value is set but there is no key assigned yet.
      if (stringEmpty(parameters[i].key) && !stringEmpty(parameters[i].value)) continue;

      // First param always starts with a `?`
      if (i == 0) {
        tempUrl += `?${parameters[i].key}=${parameters[i].value}`;
        continue;
      }
      tempUrl += `&${parameters[i].key}=${parameters[i].value}`;
    }

    setParameterizedUrl(tempUrl);
  })

  return (
    <main class="h-screen w-screen flex flex-col justify-start items-center gap-4 m-0 p-c-m">
      <div class="flex flex-col h-full w-full gap-2">
        <Select name="method" value={selectedMethod()} onChange={setSelectedMethod}>
          <SelectTrigger class={methodColors[selectedMethod()]} />
          <SelectOptionList>
            <SelectOption value="GET" class={methodColors["GET"]}>GET</SelectOption>
            <SelectOption value="POST" class={methodColors["POST"]}>POST</SelectOption>
          </SelectOptionList>
        </Select>
        <div class="flex flex-row justify-between bg-c-surface-2 border border-c-stroke pl-c-m pr-c-s py-c-s rounded-lg ">
          <input onchange={(e) => { setUrlInput(e.currentTarget.value);  parseURLParameters()}} name="url" type="url" required placeholder="https://example.com/" class="flex-1 outline-0" />
          <button title="Send API request" onclick={sendAPIRequest} class="quick-center h-8 w-8 bg-c-surface-2 hover:bg-c-surface-1 border border-c-stroke rounded-md cursor-pointer" disabled={fetchState() === FetchState.FETCHING}>
            <Switch>
              <Match when={fetchState() === FetchState.IDLE}>
                <SendIcon />
              </Match>
              <Match when={fetchState() === FetchState.FETCHING}>
                <div class="animate-spin">
                  <SpinnerIcon />
                </div>
              </Match>
            </Switch>
          </button>
        </div>
        <span class="w-full py-c-s px-c-m border border-c-stroke bg-c-surface-2 text-white/50 rounded-md">{stringEmpty(parameterizedUrl()) ? "No URL entered" : parameterizedUrl()}</span>
        <div class="flex flex-row gap-2 h-full">
          <div class="flex flex-col flex-1 border border-white/20 rounded-lg">
            <div class="flex flex-row w-full border-b border-white/20 min-h-10 bg-white/10 font-bold">
              <span class="quick-center flex-1 border-r border-white/20">Key</span>
              <span class="quick-center flex-1 ">Value</span>
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
          <Show when={apiResponse() !== null} fallback={<div class="p-2 bg-c-surface-1 border border-c-stroke rounded-lg h-full flex-1"></div>}>
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
