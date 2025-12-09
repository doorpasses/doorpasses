package io.doorpasses.sdk.models;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.Map;

/**
 * Parameters for issuing an access pass.
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public class IssueAccessPassParams {
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
    private Map<String, Object> metadata;

    // Constructor
    public IssueAccessPassParams(String cardTemplateId, String cardNumber, String fullName,
                                  String startDate, String expirationDate) {
        this.cardTemplateId = cardTemplateId;
        this.cardNumber = cardNumber;
        this.fullName = fullName;
        this.startDate = startDate;
        this.expirationDate = expirationDate;
    }

    // Getters and setters
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

    public Map<String, Object> getMetadata() { return metadata; }
    public void setMetadata(Map<String, Object> metadata) { this.metadata = metadata; }
}
