use crate::error::Result;
use crate::http_client::HttpClient;
use crate::types::{
    ApiResponse, CardTemplate, CreateCardTemplateParams, EventLogEntry, ReadEventLogParams,
    UpdateCardTemplateParams,
};
use std::sync::Arc;

/// Resource for enterprise console operations (template management)
///
/// Note: Console operations are only available for ENTERPRISE tier accounts
pub struct Console {
    http: Arc<HttpClient>,
}

impl Console {
    /// Create a new Console resource
    pub fn new(http: Arc<HttpClient>) -> Self {
        Self { http }
    }

    /// Create a new card template
    ///
    /// # Arguments
    ///
    /// * `params` - Parameters for creating the card template
    ///
    /// # Example
    ///
    /// ```no_run
    /// use doorpasses::{DoorPasses, types::{CreateCardTemplateParams, Platform, UseCase, Protocol, CardTemplateDesign}};
    ///
    /// # async fn example() -> Result<(), Box<dyn std::error::Error>> {
    /// let client = DoorPasses::new("account_id".to_string(), "shared_secret".to_string())?;
    ///
    /// let design = CardTemplateDesign {
    ///     background_color: Some("#000000".to_string()),
    ///     foreground_color: Some("#FFFFFF".to_string()),
    ///     logo_url: Some("https://example.com/logo.png".to_string()),
    ///     ..Default::default()
    /// };
    ///
    /// let params = CreateCardTemplateParams {
    ///     name: "Employee Badge".to_string(),
    ///     platform: Platform::Apple,
    ///     use_case: UseCase::EmployeeBadge,
    ///     protocol: Protocol::Seos,
    ///     design: Some(design),
    ///     support_info: None,
    ///     metadata: None,
    /// };
    ///
    /// let template = client.console.create_template(params).await?;
    /// println!("Created template: {}", template.id);
    /// # Ok(())
    /// # }
    /// ```
    pub async fn create_template(&self, params: CreateCardTemplateParams) -> Result<CardTemplate> {
        let payload = serde_json::to_value(&params)?;
        self.http
            .post("/v1/console/card-templates", Some(&payload))
            .await
    }

    /// Read a card template by ID
    ///
    /// # Arguments
    ///
    /// * `card_template_id` - The ID of the card template to retrieve
    ///
    /// # Example
    ///
    /// ```no_run
    /// use doorpasses::DoorPasses;
    ///
    /// # async fn example() -> Result<(), Box<dyn std::error::Error>> {
    /// let client = DoorPasses::new("account_id".to_string(), "shared_secret".to_string())?;
    ///
    /// let template = client.console.read_template("template_123").await?;
    /// println!("Template name: {}", template.name);
    /// # Ok(())
    /// # }
    /// ```
    pub async fn read_template(&self, card_template_id: &str) -> Result<CardTemplate> {
        self.http
            .get(&format!("/v1/console/card-templates/{}", card_template_id), None)
            .await
    }

    /// Update an existing card template
    ///
    /// # Arguments
    ///
    /// * `params` - Parameters with the template ID and fields to update
    ///
    /// # Example
    ///
    /// ```no_run
    /// use doorpasses::{DoorPasses, types::{UpdateCardTemplateParams, CardTemplateDesign}};
    ///
    /// # async fn example() -> Result<(), Box<dyn std::error::Error>> {
    /// let client = DoorPasses::new("account_id".to_string(), "shared_secret".to_string())?;
    ///
    /// let design = CardTemplateDesign {
    ///     background_color: Some("#FF0000".to_string()),
    ///     ..Default::default()
    /// };
    ///
    /// let params = UpdateCardTemplateParams {
    ///     card_template_id: "template_123".to_string(),
    ///     name: Some("Updated Employee Badge".to_string()),
    ///     design: Some(design),
    ///     support_info: None,
    ///     metadata: None,
    /// };
    ///
    /// let updated = client.console.update_template(params).await?;
    /// println!("Updated template: {}", updated.id);
    /// # Ok(())
    /// # }
    /// ```
    pub async fn update_template(&self, params: UpdateCardTemplateParams) -> Result<CardTemplate> {
        let card_template_id = params.card_template_id.clone();
        let payload = serde_json::to_value(&params)?;
        self.http
            .patch(
                &format!("/v1/console/card-templates/{}", card_template_id),
                Some(&payload),
            )
            .await
    }

    /// Publish a card template to make it available for use
    ///
    /// # Arguments
    ///
    /// * `card_template_id` - The ID of the card template to publish
    ///
    /// # Example
    ///
    /// ```no_run
    /// use doorpasses::DoorPasses;
    ///
    /// # async fn example() -> Result<(), Box<dyn std::error::Error>> {
    /// let client = DoorPasses::new("account_id".to_string(), "shared_secret".to_string())?;
    ///
    /// let response = client.console.publish_template("template_123").await?;
    /// println!("Publish result: {:?}", response.message);
    /// # Ok(())
    /// # }
    /// ```
    pub async fn publish_template(&self, card_template_id: &str) -> Result<ApiResponse> {
        self.http
            .post(
                &format!("/v1/console/card-templates/{}/publish", card_template_id),
                None,
            )
            .await
    }

    /// Read event logs with optional filtering
    ///
    /// # Arguments
    ///
    /// * `params` - Optional parameters for filtering the event log
    ///
    /// # Example
    ///
    /// ```no_run
    /// use doorpasses::{DoorPasses, types::ReadEventLogParams};
    ///
    /// # async fn example() -> Result<(), Box<dyn std::error::Error>> {
    /// let client = DoorPasses::new("account_id".to_string(), "shared_secret".to_string())?;
    ///
    /// let params = ReadEventLogParams {
    ///     access_pass_id: Some("pass_123".to_string()),
    ///     event_type: Some("access_granted".to_string()),
    ///     limit: Some(50),
    ///     ..Default::default()
    /// };
    ///
    /// let logs = client.console.event_log(Some(params)).await?;
    /// println!("Found {} events", logs.len());
    /// # Ok(())
    /// # }
    /// ```
    pub async fn event_log(
        &self,
        params: Option<ReadEventLogParams>,
    ) -> Result<Vec<EventLogEntry>> {
        let query = params
            .and_then(|p| serde_json::to_value(p).ok());

        self.http
            .get("/v1/console/event-log", query.as_ref())
            .await
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::types::{Platform, Protocol, UseCase, CardTemplateDesign, SupportInfo};

    #[test]
    fn test_card_template_design_default() {
        let design = CardTemplateDesign {
            background_color: None,
            foreground_color: None,
            label_color: None,
            logo_url: None,
            hero_image_url: None,
            strip_image_url: None,
        };
        assert!(design.background_color.is_none());
        assert!(design.logo_url.is_none());
    }

    #[test]
    fn test_support_info_creation() {
        let info = SupportInfo {
            email: None,
            phone: None,
            website: None,
        };
        assert!(info.email.is_none());
        assert!(info.phone.is_none());
    }

    #[test]
    fn test_create_template_params_serialization() {
        let params = CreateCardTemplateParams {
            name: "Test Template".to_string(),
            platform: Platform::Apple,
            use_case: UseCase::EmployeeBadge,
            protocol: Protocol::Seos,
            design: None,
            support_info: None,
            metadata: None,
        };

        let json = serde_json::to_value(&params).unwrap();
        assert!(json.is_object());
    }
}
