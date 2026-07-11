import { createSignal, Show } from "solid-js";
import "./App.css";
import { logger } from "./util/logger";
import { invoke } from "@tauri-apps/api/core";
import { twMerge } from "tailwind-merge";
import Select from "./components/Select";
import SelectOption from "./components/Select/SelectOption";
import SelectOptionList from "./components/Select/SelectOptionList";
import SelectTrigger from "./components/Select/SelectTrigger";

enum FetchState {
  IDLE,
  FETCHING
}

function App() {
  const [apiResponse, setApiResponse] = createSignal<string>("No API response...");
  const [fetchState, setFetchState] = createSignal<FetchState>(FetchState.IDLE);

  // Need some way to pass this to the Select and SelectTrigger
  // Maybe a `Record<unkown, unknown> | null` prop on the <Select>?
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
      url: url
    }) as string;

    setApiResponse(response);
    setFetchState(FetchState.IDLE);
  }

  return (
    <main class="flex flex-col justify-start items-center gap-4 m-0">
      <h1 class="text-3xl font-bold">kAPI</h1>

      <div class="flex flex-col gap-2 w-[90%]">
        <form onsubmit={handleURLFormSubmit} class="flex flex-row gap-2 p-2 rounded-lg border-2 border-white/20">
          <Select name="method">
            <SelectTrigger />
            <SelectOptionList>
              <SelectOption value="GET">GET</SelectOption>
              <SelectOption value="POST">POST</SelectOption>
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
        <p>{apiResponse()}</p>
      </div>
    </main>
  );
}

export default App;
