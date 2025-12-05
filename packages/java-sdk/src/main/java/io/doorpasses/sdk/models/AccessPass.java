package io.doorpasses.sdk.models;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.Map;

/**
 * Access Pass model.
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public class AccessPass {
    private String id;

    @JsonProperty("cardTemplateId")
    private String cardTemplateId;

    @JsonProperty("employeeId")
    private String employeeId;

    @JsonProperty("tagId")
    private String tagId;

    @JsonProperty("siteCode")
    private String siteCode;

    @JsonProperty("cardNumber")
    private String cardNumber;

    @JsonProperty("fileData")
    private String fileData;

    @JsonProperty("fullName")
    private String fullName;

    private String email;

    @JsonProperty("phoneNumber")
    private String phoneNumber;

    private Classification classification;

    @JsonProperty("startDate")
    private String startDate;

    @JsonProperty("expirationDate")
    private String expirationDate;

    @JsonProperty("employeePhoto")
    private String employeePhoto;

    private String title;
    private AccessPassState state;
    private String url;
    private Map<String, Object> metadata;

    @JsonProperty("createdAt")
    private String createdAt;

    @JsonProperty("updatedAt")
    private String updatedAt;

    // Getters and setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getCardTemplateId() { return cardTemplateId; }
    public void setCardTemplateId(String cardTemplateId) { this.cardTemplateId = cardTemplateId; }

    public String getEmployeeId() { return employeeId; }
    public void setEmployeeId(String employeeId) { this.employeeId = employeeId; }

    public String getTagId() { return tagId; }
    public void setTagId(String tagId) { this.tagId = tagId; }

    public String getSiteCode() { return siteCode; }
    public void setSiteCode(String siteCode) { this.siteCode = siteCode; }

    public String getCardNumber() { return cardNumber; }
    public void setCardNumber(String cardNumber) { this.cardNumber = cardNumber; }

    public String getFileData() { return fileData; }
    public void setFileData(String fileData) { this.fileData = fileData; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }

    public Classification getClassification() { return classification; }
    public void setClassification(Classification classification) { this.classification = classification; }

    public String getStartDate() { return startDate; }
    public void setStartDate(String startDate) { this.startDate = startDate; }

    public String getExpirationDate() { return expirationDate; }
    public void setExpirationDate(String expirationDate) { this.expirationDate = expirationDate; }

    public String getEmployeePhoto() { return employeePhoto; }
    public void setEmployeePhoto(String employeePhoto) { this.employeePhoto = employeePhoto; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public AccessPassState getState() { return state; }
    public void setState(AccessPassState state) { this.state = state; }

    public String getUrl() { return url; }
    public void setUrl(String url) { this.url = url; }

    public Map<String, Object> getMetadata() { return metadata; }
    public void setMetadata(Map<String, Object> metadata) { this.metadata = metadata; }

    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }

    public String getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(String updatedAt) { this.updatedAt = updatedAt; }
}
