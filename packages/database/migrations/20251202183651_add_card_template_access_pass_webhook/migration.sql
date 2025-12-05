-- CreateTable
CREATE TABLE "CardTemplate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "exId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "useCase" TEXT NOT NULL,
    "protocol" TEXT NOT NULL,
    "allowOnMultipleDevices" BOOLEAN NOT NULL DEFAULT false,
    "watchCount" INTEGER,
    "iphoneCount" INTEGER,
    "backgroundColor" TEXT,
    "labelColor" TEXT,
    "labelSecondaryColor" TEXT,
    "backgroundImage" TEXT,
    "logoImage" TEXT,
    "iconImage" TEXT,
    "supportUrl" TEXT,
    "supportPhoneNumber" TEXT,
    "supportEmail" TEXT,
    "privacyPolicyUrl" TEXT,
    "termsAndConditionsUrl" TEXT,
    "publishStatus" TEXT NOT NULL DEFAULT 'DRAFT',
    "publishedAt" DATETIME,
    "metadata" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CardTemplate_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CardTemplate_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AccessPass" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "exId" TEXT NOT NULL,
    "cardTemplateId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "employeeId" TEXT,
    "fullName" TEXT NOT NULL,
    "email" TEXT,
    "phoneNumber" TEXT,
    "classification" TEXT,
    "title" TEXT,
    "employeePhoto" TEXT,
    "tagId" TEXT,
    "siteCode" TEXT,
    "cardNumber" TEXT,
    "fileData" TEXT,
    "startDate" DATETIME NOT NULL,
    "expirationDate" DATETIME NOT NULL,
    "memberId" TEXT,
    "membershipStatus" TEXT,
    "isPassReadyToTransact" BOOLEAN,
    "tileData" TEXT,
    "reservations" TEXT,
    "state" TEXT NOT NULL DEFAULT 'PENDING',
    "devices" TEXT,
    "metadata" TEXT,
    "installUrl" TEXT,
    "installedAt" DATETIME,
    "lastUsedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "AccessPass_cardTemplateId_fkey" FOREIGN KEY ("cardTemplateId") REFERENCES "CardTemplate" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "AccessPass_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CredentialProfile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "exId" TEXT NOT NULL,
    "cardTemplateId" TEXT NOT NULL,
    "protocol" TEXT NOT NULL,
    "desfireAppId" TEXT,
    "desfireFileId" TEXT,
    "desfireKey" TEXT,
    "seosEndpoint" TEXT,
    "seosCredentialId" TEXT,
    "smartTapIssuer" TEXT,
    "smartTapClass" TEXT,
    "metadata" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CredentialProfile_cardTemplateId_fkey" FOREIGN KEY ("cardTemplateId") REFERENCES "CardTemplate" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Webhook" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "organizationId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "events" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "secret" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Webhook_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "WebhookDelivery" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "webhookId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "payload" TEXT NOT NULL,
    "responseStatus" INTEGER,
    "responseBody" TEXT,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "lastAttemptAt" DATETIME,
    "deliveredAt" DATETIME,
    "failedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "WebhookDelivery_webhookId_fkey" FOREIGN KEY ("webhookId") REFERENCES "Webhook" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PassEventLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "cardTemplateId" TEXT,
    "accessPassId" TEXT,
    "eventType" TEXT NOT NULL,
    "device" TEXT,
    "metadata" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PassEventLog_cardTemplateId_fkey" FOREIGN KEY ("cardTemplateId") REFERENCES "CardTemplate" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "PassEventLog_accessPassId_fkey" FOREIGN KEY ("accessPassId") REFERENCES "AccessPass" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ApiKey" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastUsedAt" DATETIME,
    "expiresAt" DATETIME,
    CONSTRAINT "ApiKey_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ApiKey_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_ApiKey" ("createdAt", "expiresAt", "id", "key", "lastUsedAt", "name", "organizationId", "userId") SELECT "createdAt", "expiresAt", "id", "key", "lastUsedAt", "name", "organizationId", "userId" FROM "ApiKey";
DROP TABLE "ApiKey";
ALTER TABLE "new_ApiKey" RENAME TO "ApiKey";
CREATE UNIQUE INDEX "ApiKey_key_key" ON "ApiKey"("key");
CREATE INDEX "ApiKey_userId_idx" ON "ApiKey"("userId");
CREATE INDEX "ApiKey_organizationId_idx" ON "ApiKey"("organizationId");
CREATE INDEX "ApiKey_key_idx" ON "ApiKey"("key");
CREATE TABLE "new_WaitlistEntry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "points" INTEGER NOT NULL DEFAULT 1,
    "referralCode" TEXT NOT NULL,
    "hasJoinedDiscord" BOOLEAN NOT NULL DEFAULT false,
    "hasEarlyAccess" BOOLEAN NOT NULL DEFAULT false,
    "grantedAccessAt" DATETIME,
    "grantedAccessBy" TEXT,
    "referredById" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "WaitlistEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "WaitlistEntry_grantedAccessBy_fkey" FOREIGN KEY ("grantedAccessBy") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "WaitlistEntry_referredById_fkey" FOREIGN KEY ("referredById") REFERENCES "WaitlistEntry" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_WaitlistEntry" ("createdAt", "grantedAccessAt", "grantedAccessBy", "hasEarlyAccess", "hasJoinedDiscord", "id", "points", "referralCode", "referredById", "updatedAt", "userId") SELECT "createdAt", "grantedAccessAt", "grantedAccessBy", "hasEarlyAccess", "hasJoinedDiscord", "id", "points", "referralCode", "referredById", "updatedAt", "userId" FROM "WaitlistEntry";
DROP TABLE "WaitlistEntry";
ALTER TABLE "new_WaitlistEntry" RENAME TO "WaitlistEntry";
CREATE UNIQUE INDEX "WaitlistEntry_userId_key" ON "WaitlistEntry"("userId");
CREATE UNIQUE INDEX "WaitlistEntry_referralCode_key" ON "WaitlistEntry"("referralCode");
CREATE INDEX "WaitlistEntry_userId_idx" ON "WaitlistEntry"("userId");
CREATE INDEX "WaitlistEntry_referralCode_idx" ON "WaitlistEntry"("referralCode");
CREATE INDEX "WaitlistEntry_points_createdAt_idx" ON "WaitlistEntry"("points", "createdAt");
CREATE INDEX "WaitlistEntry_hasEarlyAccess_idx" ON "WaitlistEntry"("hasEarlyAccess");
CREATE INDEX "WaitlistEntry_grantedAccessBy_idx" ON "WaitlistEntry"("grantedAccessBy");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "CardTemplate_exId_key" ON "CardTemplate"("exId");

-- CreateIndex
CREATE INDEX "CardTemplate_organizationId_idx" ON "CardTemplate"("organizationId");

-- CreateIndex
CREATE INDEX "CardTemplate_createdById_idx" ON "CardTemplate"("createdById");

-- CreateIndex
CREATE INDEX "CardTemplate_publishStatus_idx" ON "CardTemplate"("publishStatus");

-- CreateIndex
CREATE UNIQUE INDEX "AccessPass_exId_key" ON "AccessPass"("exId");

-- CreateIndex
CREATE INDEX "AccessPass_cardTemplateId_idx" ON "AccessPass"("cardTemplateId");

-- CreateIndex
CREATE INDEX "AccessPass_createdById_idx" ON "AccessPass"("createdById");

-- CreateIndex
CREATE INDEX "AccessPass_employeeId_idx" ON "AccessPass"("employeeId");

-- CreateIndex
CREATE INDEX "AccessPass_state_idx" ON "AccessPass"("state");

-- CreateIndex
CREATE UNIQUE INDEX "CredentialProfile_exId_key" ON "CredentialProfile"("exId");

-- CreateIndex
CREATE INDEX "CredentialProfile_cardTemplateId_idx" ON "CredentialProfile"("cardTemplateId");

-- CreateIndex
CREATE INDEX "Webhook_organizationId_idx" ON "Webhook"("organizationId");

-- CreateIndex
CREATE INDEX "WebhookDelivery_webhookId_idx" ON "WebhookDelivery"("webhookId");

-- CreateIndex
CREATE INDEX "WebhookDelivery_eventType_idx" ON "WebhookDelivery"("eventType");

-- CreateIndex
CREATE INDEX "PassEventLog_cardTemplateId_idx" ON "PassEventLog"("cardTemplateId");

-- CreateIndex
CREATE INDEX "PassEventLog_accessPassId_idx" ON "PassEventLog"("accessPassId");

-- CreateIndex
CREATE INDEX "PassEventLog_eventType_idx" ON "PassEventLog"("eventType");

-- CreateIndex
CREATE INDEX "PassEventLog_createdAt_idx" ON "PassEventLog"("createdAt");
