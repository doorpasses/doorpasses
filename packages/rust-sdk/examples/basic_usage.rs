use doorpasses::{DoorPasses, types::IssueAccessPassParams};

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    // Initialize the DoorPasses client
    let account_id = std::env::var("DOORPASSES_ACCOUNT_ID")
        .expect("DOORPASSES_ACCOUNT_ID environment variable not set");
    let shared_secret = std::env::var("DOORPASSES_SHARED_SECRET")
        .expect("DOORPASSES_SHARED_SECRET environment variable not set");

    let client = DoorPasses::new(account_id, shared_secret)?;

    // Check API health
    println!("Checking API health...");
    let health = client.health().await?;
    println!("API Status: {:?}", health);

    // Issue a new access pass
    println!("\nIssuing a new access pass...");
    let params = IssueAccessPassParams {
        card_template_id: "your_template_id".to_string(),
        full_name: "John Doe".to_string(),
        start_date: "2024-01-01".to_string(),
        expiration_date: "2024-12-31".to_string(),
        email: Some("john.doe@example.com".to_string()),
        phone_number: Some("+1234567890".to_string()),
        employee_id: Some("EMP001".to_string()),
        ..Default::default()
    };

    let access_pass = client.access_passes.issue(params).await?;
    println!("Created access pass:");
    println!("  ID: {}", access_pass.id);
    println!("  Name: {}", access_pass.full_name);
    println!("  State: {:?}", access_pass.state);
    println!("  URL: {:?}", access_pass.url);

    // List all access passes
    println!("\nListing all access passes...");
    let passes = client.access_passes.list(None).await?;
    println!("Total passes: {}", passes.len());
    for pass in passes.iter().take(5) {
        println!("  - {} ({})", pass.full_name, pass.id);
    }

    Ok(())
}
