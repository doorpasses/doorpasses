import { generatePayloadSignature, encodePayload } from '../../src/utils/auth';
import prisma from '../../src/config/database';
import { Tier, Platform, UseCase, Protocol, PublishStatus, PassState } from '@prisma/client';

/**
 * Create a test account for integration testing
 */
export async function createTestAccount(tier: Tier = 'STARTER') {
  const accountId = `0xtest${Math.random().toString(36).substring(7)}`;
  const sharedSecret = 'test-shared-secret-12345';

  const account = await prisma.account.create({
    data: {
      accountId,
      sharedSecret,
      tier,
      name: `Test Account ${accountId}`,
      email: `test-${accountId}@example.com`,
      isActive: true,
    },
  });

  return {
    account,
    accountId,
    sharedSecret,
  };
}

/**
 * Generate authentication headers for API requests
 */
export function generateAuthHeaders(
  accountId: string,
  sharedSecret: string,
  payload?: any
): Record<string, string> {
  const encodedPayload = payload ? encodePayload(payload) : encodePayload({ id: '0' });
  const signature = generatePayloadSignature(sharedSecret, encodedPayload);

  return {
    'X-ACCT-ID': accountId,
    'X-PAYLOAD-SIG': signature,
  };
}

/**
 * Generate authentication headers with sig_payload for GET requests
 */
export function generateAuthHeadersForGet(
  accountId: string,
  sharedSecret: string,
  sigPayload: any = { id: '0' }
): { headers: Record<string, string>; query: Record<string, string> } {
  const encodedPayload = encodePayload(sigPayload);
  const signature = generatePayloadSignature(sharedSecret, encodedPayload);

  return {
    headers: {
      'X-ACCT-ID': accountId,
      'X-PAYLOAD-SIG': signature,
    },
    query: {
      sig_payload: Buffer.from(JSON.stringify(sigPayload)).toString('base64'),
    },
  };
}

/**
 * Create a test card template
 * @param accountInternalId - The internal UUID of the account (account.id), not the external accountId
 */
export async function createTestCardTemplate(accountInternalId: string) {
  const cardTemplate = await prisma.cardTemplate.create({
    data: {
      exId: `0xtest${Math.random().toString(36).substring(7)}`,
      accountId: accountInternalId,
      name: 'Test Card Template',
      platform: Platform.APPLE,
      useCase: UseCase.EMPLOYEE_BADGE,
      protocol: Protocol.DESFIRE,
      allowOnMultipleDevices: false,
      publishStatus: PublishStatus.DRAFT,
      backgroundColor: '#000000',
      labelColor: '#FFFFFF',
      metadata: {
        description: 'Test card template for integration testing',
      },
    },
  });

  return cardTemplate;
}

/**
 * Create a test access pass
 */
export async function createTestAccessPass(
  accountId: string,
  cardTemplateId: string,
  data: Partial<{
    employeeId: string;
    fullName: string;
    email: string;
    phoneNumber: string;
    classification: string;
    title: string;
    tagId: string;
    siteCode: string;
    cardNumber: string;
    fileData: string;
    startDate: Date;
    expirationDate: Date;
    state: PassState;
    metadata: any;
  }> = {}
) {
  const now = new Date();
  const oneYearLater = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);

  const accessPass = await prisma.accessPass.create({
    data: {
      exId: `0xtest${Math.random().toString(36).substring(7)}`,
      cardTemplateId,
      employeeId: data.employeeId || `emp-${Math.random().toString(36).substring(7)}`,
      fullName: data.fullName || 'Test Employee',
      email: data.email || 'test@example.com',
      phoneNumber: data.phoneNumber || '+1234567890',
      classification: data.classification || 'full_time',
      title: data.title || 'Software Engineer',
      tagId: data.tagId || 'AB12CD34EF5678',
      siteCode: data.siteCode || '100',
      cardNumber: data.cardNumber || '12345',
      fileData: data.fileData,
      startDate: data.startDate || now,
      expirationDate: data.expirationDate || oneYearLater,
      state: data.state || PassState.ACTIVE,
      metadata: data.metadata || {},
    },
  });

  return accessPass;
}

/**
 * Clean up test account and related data
 */
export async function cleanupTestAccount(accountId: string) {
  const account = await prisma.account.findUnique({
    where: { accountId },
    select: { id: true },
  });

  if (!account) {
    return; // Account doesn't exist, nothing to clean up
  }

  // Delete access passes first (foreign key constraint)
  await prisma.accessPass.deleteMany({
    where: {
      cardTemplate: {
        accountId: account.id,
      },
    },
  });

  // Delete credential profiles
  await prisma.credentialProfile.deleteMany({
    where: {
      cardTemplate: {
        accountId: account.id,
      },
    },
  });

  // Delete event logs (EventLog doesn't have accountId, it relates through cardTemplate)
  // First get all card template IDs for this account
  const cardTemplates = await prisma.cardTemplate.findMany({
    where: { accountId: account.id },
    select: { id: true },
  });

  const cardTemplateIds = cardTemplates.map(ct => ct.id);

  // Delete event logs related to these card templates
  if (cardTemplateIds.length > 0) {
    await prisma.eventLog.deleteMany({
      where: {
        OR: [
          { cardTemplateId: { in: cardTemplateIds } },
          {
            accessPass: {
              cardTemplateId: { in: cardTemplateIds }
            }
          }
        ]
      },
    });
  }

  // Delete card templates
  await prisma.cardTemplate.deleteMany({
    where: { accountId: account.id },
  });

  // Delete webhooks
  await prisma.webhook.deleteMany({
    where: { accountId: account.id },
  });

  // Delete API keys
  await prisma.apiKey.deleteMany({
    where: { accountId: account.id },
  });

  // Delete account
  await prisma.account.delete({
    where: { id: account.id },
  });
}

/**
 * Create a published card template for wallet testing
 * @param accountInternalId - The internal UUID of the account (account.id), not the external accountId
 */
export async function createPublishedCardTemplate(accountInternalId: string) {
  const cardTemplate = await prisma.cardTemplate.create({
    data: {
      exId: `0xtest${Math.random().toString(36).substring(7)}`,
      accountId: accountInternalId,
      name: 'Test Published Card',
      platform: Platform.APPLE,
      useCase: UseCase.EMPLOYEE_BADGE,
      protocol: Protocol.DESFIRE,
      allowOnMultipleDevices: true,
      publishStatus: PublishStatus.PUBLISHED,
      publishedAt: new Date(),
      backgroundColor: '#1a73e8',
      labelColor: '#FFFFFF',
      labelSecondaryColor: '#CCCCCC',
      supportUrl: 'https://test.example.com/support',
      supportEmail: 'support@test.example.com',
      metadata: {
        description: 'Published card template for wallet testing',
      },
    },
  });

  return cardTemplate;
}
