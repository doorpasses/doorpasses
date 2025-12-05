use crate::auth::{create_auth_headers, create_get_auth_headers};
use crate::error::{Result, DoorPassesError};
use reqwest::{Client, Response, StatusCode};
use serde::de::DeserializeOwned;
use std::time::Duration;

/// HTTP client for making authenticated requests to the DoorPasses API
pub struct HttpClient {
    client: Client,
    account_id: String,
    shared_secret: String,
    base_url: String,
}

impl HttpClient {
    /// Create a new HTTP client
    pub fn new(
        account_id: String,
        shared_secret: String,
        base_url: String,
        timeout: Duration,
    ) -> Result<Self> {
        let client = Client::builder()
            .timeout(timeout)
            .build()
            .map_err(DoorPassesError::HttpError)?;

        Ok(Self {
            client,
            account_id,
            shared_secret,
            base_url,
        })
    }

    /// Make a GET request
    pub async fn get<T: DeserializeOwned>(
        &self,
        path: &str,
        query_params: Option<&serde_json::Value>,
    ) -> Result<T> {
        let url = format!("{}{}", self.base_url, path);
        let (account_id, signature) =
            create_get_auth_headers(&self.account_id, &self.shared_secret, query_params);

        let mut request = self
            .client
            .get(&url)
            .header("X-ACCT-ID", account_id)
            .header("X-PAYLOAD-SIG", signature)
            .header("Content-Type", "application/json");

        // Add query parameters if provided
        if let Some(params) = query_params {
            if let Some(obj) = params.as_object() {
                for (key, value) in obj {
                    if let Some(v) = value.as_str() {
                        request = request.query(&[(key, v)]);
                    } else if let Some(v) = value.as_i64() {
                        request = request.query(&[(key, v.to_string())]);
                    } else if let Some(v) = value.as_u64() {
                        request = request.query(&[(key, v.to_string())]);
                    } else if let Some(v) = value.as_bool() {
                        request = request.query(&[(key, v.to_string())]);
                    }
                }
            }
        }

        let response = request.send().await?;
        self.handle_response(response).await
    }

    /// Make a POST request
    pub async fn post<T: DeserializeOwned>(
        &self,
        path: &str,
        data: Option<&serde_json::Value>,
    ) -> Result<T> {
        let url = format!("{}{}", self.base_url, path);
        let (account_id, signature) =
            create_auth_headers(&self.account_id, &self.shared_secret, data);

        let request = self
            .client
            .post(&url)
            .header("X-ACCT-ID", account_id)
            .header("X-PAYLOAD-SIG", signature)
            .header("Content-Type", "application/json");

        let request = if let Some(d) = data {
            request.json(d)
        } else {
            request.json(&serde_json::json!({}))
        };

        let response = request.send().await?;
        self.handle_response(response).await
    }

    /// Make a PATCH request
    pub async fn patch<T: DeserializeOwned>(
        &self,
        path: &str,
        data: Option<&serde_json::Value>,
    ) -> Result<T> {
        let url = format!("{}{}", self.base_url, path);
        let (account_id, signature) =
            create_auth_headers(&self.account_id, &self.shared_secret, data);

        let request = self
            .client
            .patch(&url)
            .header("X-ACCT-ID", account_id)
            .header("X-PAYLOAD-SIG", signature)
            .header("Content-Type", "application/json");

        let request = if let Some(d) = data {
            request.json(d)
        } else {
            request.json(&serde_json::json!({}))
        };

        let response = request.send().await?;
        self.handle_response(response).await
    }

    /// Make a DELETE request
    pub async fn delete<T: DeserializeOwned>(&self, path: &str) -> Result<T> {
        let url = format!("{}{}", self.base_url, path);
        let (account_id, signature) =
            create_auth_headers(&self.account_id, &self.shared_secret, None);

        let response = self
            .client
            .delete(&url)
            .header("X-ACCT-ID", account_id)
            .header("X-PAYLOAD-SIG", signature)
            .header("Content-Type", "application/json")
            .send()
            .await?;

        self.handle_response(response).await
    }

    /// Handle HTTP response and convert to Result
    async fn handle_response<T: DeserializeOwned>(&self, response: Response) -> Result<T> {
        let status = response.status();

        if status.is_success() {
            let data = response.json::<T>().await?;
            Ok(data)
        } else {
            let status_code = status.as_u16();
            let error_message = response
                .text()
                .await
                .unwrap_or_else(|_| "Unknown error".to_string());

            Err(match status {
                StatusCode::NOT_FOUND => DoorPassesError::NotFound(error_message),
                StatusCode::TOO_MANY_REQUESTS => DoorPassesError::RateLimitExceeded,
                StatusCode::REQUEST_TIMEOUT => DoorPassesError::Timeout,
                StatusCode::UNAUTHORIZED | StatusCode::FORBIDDEN => {
                    DoorPassesError::AuthError(error_message)
                }
                _ => DoorPassesError::ApiError {
                    status: status_code,
                    message: error_message,
                },
            })
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_http_client_creation() {
        let client = HttpClient::new(
            "test_account".to_string(),
            "test_secret".to_string(),
            "https://api.doorpasses.io".to_string(),
            Duration::from_secs(30),
        );

        assert!(client.is_ok());
    }

    #[test]
    fn test_http_client_urls() {
        let client = HttpClient::new(
            "test_account".to_string(),
            "test_secret".to_string(),
            "https://api.doorpasses.io".to_string(),
            Duration::from_secs(30),
        )
        .unwrap();

        assert_eq!(client.base_url, "https://api.doorpasses.io");
        assert_eq!(client.account_id, "test_account");
    }
}
