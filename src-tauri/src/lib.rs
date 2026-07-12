use serde::Serialize;

#[derive(Debug, Serialize)]
enum APIMethods {
    GET,
    POST,
}

#[derive(Debug, Serialize)]
struct APIResponse {
    method: APIMethods,
    content_type: String,
    text: String,
}

#[tauri::command]
async fn send_api_request(method: String, url: String) -> APIResponse {
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
    }
    .expect("Error fetching request");

    let mut content_type = "text/plain".to_string();

    if let Some(header_value) = res.headers().get("content-type") {
        match header_value.to_str() {
            Ok(value) => {
                println!("Response of type: {}", value);
                content_type = value.split(";").next().unwrap_or("").trim().to_string();
            }
            Err(_) => {
                println!("Content-Type header contains invalid data");
            }
        }
    } else {
        println!("Content-Type header is missing");
    }

    let res_text = res.text().await.unwrap();

    APIResponse {
        method: api_method,
        content_type: content_type,
        text: res_text,
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![send_api_request])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
