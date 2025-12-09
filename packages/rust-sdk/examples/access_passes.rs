use doorpasses::{
    DoorPasses,
    types::{
        IssueAccessPassParams, ListAccessPassesParams, UpdateAccessPassParams,
        AccessPassState, Classification,
    },
};

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    // Initialize client
    let account_id = std::env::var("DOORPASSES_ACCOUNT_ID")
        .expect("DOORPASSES_ACCOUNT_ID environment variable not set");
    let shared_secret = std::env::var("DOORPASSES_SHARED_SECRET")
        .expect("DOORPASSES_SHARED_SECRET environment variable not set");

    let client = DoorPasses::new(account_id, shared_secret)?;

    // Issue a new access pass
    println!("=== Issuing Access Pass ===");
    let issue_params = IssueAccessPassParams {
        card_template_id: "your_template_id".to_string(),
        full_name: "Jane Smith".to_string(),
        start_date: "2024-01-01".to_string(),
        expiration_date: "2024-12-31".to_string(),
        email: Some("jane.smith@example.com".to_string()),
        phone_number: Some("+9876543210".to_string()),
        employee_id: Some("EMP002".to_string()),
        classification: Some(Classification::FullTime),
        site_code: Some("SITE-A".to_string()),
        ..Default::default()
    };

    let new_pass = client.access_passes.issue(issue_params).await?;
    println!("Created: {} (ID: {})", new_pass.full_name, new_pass.id);

    // List active passes
    println!("\n=== Listing Active Passes ===");
    let list_params = ListAccessPassesParams {
        state: Some(AccessPassState::Active),
        limit: Some(10),
        ..Default::default()
    };

    let active_passes = client.access_passes.list(Some(list_params)).await?;
    println!("Found {} active passes", active_passes.len());
    for pass in active_passes.iter() {
        println!("  - {}: {} ({})", pass.id, pass.full_name, pass.employee_id.as_deref().unwrap_or("N/A"));
    }

    // Update an access pass
    println!("\n=== Updating Access Pass ===");
    let update_params = UpdateAccessPassParams {
        access_pass_id: new_pass.id.clone(),
        full_name: Some("Jane Doe-Smith".to_string()),
        email: Some("jane.doesmith@example.com".to_string()),
        ..Default::default()
    };

    let updated_pass = client.access_passes.update(update_params).await?;
    println!("Updated: {}", updated_pass.full_name);

    // Suspend the pass
    println!("\n=== Suspending Access Pass ===");
    let suspend_response = client.access_passes.suspend(&new_pass.id).await?;
    println!("Suspend result: {:?}", suspend_response.message);

    // Resume the pass
    println!("\n=== Resuming Access Pass ===");
    let resume_response = client.access_passes.resume(&new_pass.id).await?;
    println!("Resume result: {:?}", resume_response.message);

    // Unlink the pass
    println!("\n=== Unlinking Access Pass ===");
    let unlink_response = client.access_passes.unlink(&new_pass.id).await?;
    println!("Unlink result: {:?}", unlink_response.message);

    // Delete the pass
    println!("\n=== Deleting Access Pass ===");
    let delete_response = client.access_passes.delete(&new_pass.id).await?;
    println!("Delete result: {:?}", delete_response.message);

    Ok(())
}
