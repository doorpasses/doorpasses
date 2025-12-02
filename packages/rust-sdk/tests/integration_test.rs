use doorpasses::{DoorPasses, DoorPassesConfig};
use std::time::Duration;

#[test]
fn test_client_initialization() {
    let client = DoorPasses::new("test_account".to_string(), "test_secret".to_string());
    assert!(client.is_ok());
}

#[test]
fn test_client_with_custom_config() {
    let config = DoorPassesConfig::new("account".to_string(), "secret".to_string())
        .with_base_url("https://api.test.doorpasses.io".to_string())
        .with_timeout(Duration::from_secs(45));

    let client = DoorPasses::with_config(config);
    assert!(client.is_ok());
}

#[test]
fn test_client_validation_empty_account_id() {
    let result = DoorPasses::new("".to_string(), "secret".to_string());
    assert!(result.is_err());
}

#[test]
fn test_client_validation_empty_secret() {
    let result = DoorPasses::new("account".to_string(), "".to_string());
    assert!(result.is_err());
}

#[test]
fn test_config_defaults() {
    let config = DoorPassesConfig::new("account".to_string(), "secret".to_string());
    assert_eq!(config.base_url, "https://api.doorpasses.io");
    assert_eq!(config.timeout, Duration::from_secs(30));
}
