use crate::error::Result;
use crate::http_client::HttpClient;
use crate::types::{
    AccessPass, ApiResponse, IssueAccessPassParams, ListAccessPassesParams, UpdateAccessPassParams,
};
use std::sync::Arc;

/// Resource for managing access passes
pub struct AccessPasses {
    http: Arc<HttpClient>,
}

impl AccessPasses {
    /// Create a new AccessPasses resource
    pub fn new(http: Arc<HttpClient>) -> Self {
        Self { http }
    }

    /// Issue a new access pass
    ///
    /// # Arguments
    ///
    /// * `params` - Parameters for creating the access pass
    ///
    /// # Example
    ///
    /// ```no_run
    /// use doorpasses::{DoorPasses, types::IssueAccessPassParams};
    ///
    /// # async fn example() -> Result<(), Box<dyn std::error::Error>> {
    /// let client = DoorPasses::new("account_id".to_string(), "shared_secret".to_string())?;
    ///
    /// let params = IssueAccessPassParams {
    ///     card_template_id: "template_123".to_string(),
    ///     full_name: "John Doe".to_string(),
    ///     start_date: "2024-01-01".to_string(),
    ///     expiration_date: "2024-12-31".to_string(),
    ///     employee_id: Some("EMP001".to_string()),
    ///     email: Some("john@example.com".to_string()),
    ///     phone_number: Some("+1234567890".to_string()),
    ///     ..Default::default()
    /// };
    ///
    /// let access_pass = client.access_passes.issue(params).await?;
    /// println!("Created access pass: {}", access_pass.id);
    /// # Ok(())
    /// # }
    /// ```
    pub async fn issue(&self, params: IssueAccessPassParams) -> Result<AccessPass> {
        let payload = serde_json::to_value(&params)?;
        self.http.post("/v1/access-passes", Some(&payload)).await
    }

    /// List access passes with optional filtering
    ///
    /// # Arguments
    ///
    /// * `params` - Optional parameters for filtering the list
    ///
    /// # Example
    ///
    /// ```no_run
    /// use doorpasses::{DoorPasses, types::{ListAccessPassesParams, AccessPassState}};
    ///
    /// # async fn example() -> Result<(), Box<dyn std::error::Error>> {
    /// let client = DoorPasses::new("account_id".to_string(), "shared_secret".to_string())?;
    ///
    /// let params = ListAccessPassesParams {
    ///     state: Some(AccessPassState::Active),
    ///     limit: Some(10),
    ///     ..Default::default()
    /// };
    ///
    /// let passes = client.access_passes.list(Some(params)).await?;
    /// println!("Found {} active passes", passes.len());
    /// # Ok(())
    /// # }
    /// ```
    pub async fn list(&self, params: Option<ListAccessPassesParams>) -> Result<Vec<AccessPass>> {
        let query = params
            .and_then(|p| serde_json::to_value(p).ok());

        self.http
            .get("/v1/access-passes", query.as_ref())
            .await
    }

    /// Update an existing access pass
    ///
    /// # Arguments
    ///
    /// * `params` - Parameters with the access pass ID and fields to update
    ///
    /// # Example
    ///
    /// ```no_run
    /// use doorpasses::{DoorPasses, types::UpdateAccessPassParams};
    ///
    /// # async fn example() -> Result<(), Box<dyn std::error::Error>> {
    /// let client = DoorPasses::new("account_id".to_string(), "shared_secret".to_string())?;
    ///
    /// let params = UpdateAccessPassParams {
    ///     access_pass_id: "pass_123".to_string(),
    ///     full_name: Some("Jane Doe".to_string()),
    ///     email: Some("jane@example.com".to_string()),
    ///     ..Default::default()
    /// };
    ///
    /// let updated_pass = client.access_passes.update(params).await?;
    /// println!("Updated pass: {}", updated_pass.id);
    /// # Ok(())
    /// # }
    /// ```
    pub async fn update(&self, params: UpdateAccessPassParams) -> Result<AccessPass> {
        let access_pass_id = params.access_pass_id.clone();
        let payload = serde_json::to_value(&params)?;
        self.http
            .patch(
                &format!("/v1/access-passes/{}", access_pass_id),
                Some(&payload),
            )
            .await
    }

    /// Suspend an access pass
    ///
    /// # Arguments
    ///
    /// * `access_pass_id` - The ID of the access pass to suspend
    ///
    /// # Example
    ///
    /// ```no_run
    /// use doorpasses::DoorPasses;
    ///
    /// # async fn example() -> Result<(), Box<dyn std::error::Error>> {
    /// let client = DoorPasses::new("account_id".to_string(), "shared_secret".to_string())?;
    ///
    /// let response = client.access_passes.suspend("pass_123").await?;
    /// println!("Suspend result: {:?}", response.message);
    /// # Ok(())
    /// # }
    /// ```
    pub async fn suspend(&self, access_pass_id: &str) -> Result<ApiResponse> {
        self.http
            .post(&format!("/v1/access-passes/{}/suspend", access_pass_id), None)
            .await
    }

    /// Resume a suspended access pass
    ///
    /// # Arguments
    ///
    /// * `access_pass_id` - The ID of the access pass to resume
    ///
    /// # Example
    ///
    /// ```no_run
    /// use doorpasses::DoorPasses;
    ///
    /// # async fn example() -> Result<(), Box<dyn std::error::Error>> {
    /// let client = DoorPasses::new("account_id".to_string(), "shared_secret".to_string())?;
    ///
    /// let response = client.access_passes.resume("pass_123").await?;
    /// println!("Resume result: {:?}", response.message);
    /// # Ok(())
    /// # }
    /// ```
    pub async fn resume(&self, access_pass_id: &str) -> Result<ApiResponse> {
        self.http
            .post(&format!("/v1/access-passes/{}/resume", access_pass_id), None)
            .await
    }

    /// Unlink an access pass from the device
    ///
    /// # Arguments
    ///
    /// * `access_pass_id` - The ID of the access pass to unlink
    ///
    /// # Example
    ///
    /// ```no_run
    /// use doorpasses::DoorPasses;
    ///
    /// # async fn example() -> Result<(), Box<dyn std::error::Error>> {
    /// let client = DoorPasses::new("account_id".to_string(), "shared_secret".to_string())?;
    ///
    /// let response = client.access_passes.unlink("pass_123").await?;
    /// println!("Unlink result: {:?}", response.message);
    /// # Ok(())
    /// # }
    /// ```
    pub async fn unlink(&self, access_pass_id: &str) -> Result<ApiResponse> {
        self.http
            .post(&format!("/v1/access-passes/{}/unlink", access_pass_id), None)
            .await
    }

    /// Permanently delete an access pass
    ///
    /// # Arguments
    ///
    /// * `access_pass_id` - The ID of the access pass to delete
    ///
    /// # Example
    ///
    /// ```no_run
    /// use doorpasses::DoorPasses;
    ///
    /// # async fn example() -> Result<(), Box<dyn std::error::Error>> {
    /// let client = DoorPasses::new("account_id".to_string(), "shared_secret".to_string())?;
    ///
    /// let response = client.access_passes.delete("pass_123").await?;
    /// println!("Delete result: {:?}", response.message);
    /// # Ok(())
    /// # }
    /// ```
    pub async fn delete(&self, access_pass_id: &str) -> Result<ApiResponse> {
        self.http
            .delete(&format!("/v1/access-passes/{}", access_pass_id))
            .await
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_issue_params_default() {
        let params = IssueAccessPassParams::default();
        assert!(params.card_template_id.is_empty());
        assert!(params.email.is_none());
    }

    #[test]
    fn test_list_params_default() {
        let params = ListAccessPassesParams::default();
        assert!(params.card_template_id.is_none());
        assert!(params.limit.is_none());
    }

    #[test]
    fn test_update_params_default() {
        let params = UpdateAccessPassParams::default();
        assert!(params.access_pass_id.is_empty());
        assert!(params.email.is_none());
    }
}
