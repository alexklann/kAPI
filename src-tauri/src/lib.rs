#[derive(Debug)]
enum APIMethods {
    GET,
    POST,
}

#[tauri::command]
async fn send_api_request(method: String, url: String) -> String {
    let api_method: APIMethods = match method.to_lowercase().as_str() {
        "get" => APIMethods::GET,
        "post" => APIMethods::POST,
        _ => APIMethods::GET,
    };

    println!(
        "Received API request with method: {} | url: {}",
        method, url
    );

    let client = reqwest::Client::new();

    let res = match api_method {
        APIMethods::GET => client.get(url).send().await,
        APIMethods::POST => client.post(url).send().await,
    };

    res.unwrap().text().await.unwrap()
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![send_api_request])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
