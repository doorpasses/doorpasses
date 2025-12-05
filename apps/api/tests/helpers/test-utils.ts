import { generatePayloadSignature, encodePayload } from '../../src/utils/auth';
import prisma from '../../src/config/database';
import { Platform, UseCase, Protocol, PublishStatus, PassState } from '@prisma/client';

/**
 * Create a test organization and user for integration testing
 */
export async function createTestAccount(tier: string = 'STARTER') {
  const orgSlug = `test-org-${Math.random().toString(36).substring(7)}`;
  const accountId = `0xtest${Math.random().toString(36).substring(7)}`;
  const sharedSecret = 'test-shared-secret-12345';

  // Create a test user
  const user = await prisma.user.create({
    data: {
      email: `test-${accountId}@example.com`,
      username: `testuser-${accountId}`,
      name: `Test User ${accountId}`,
    },
  });

  // Get or create the admin role
  let adminRole = await prisma.organizationRole.findFirst({
    where: { name: 'admin' },
  });

  if (!adminRole) {
    adminRole = await prisma.organizationRole.create({
      data: {
        name: 'admin',
        description: 'Administrator role',
        level: 4,
      },
    });
  }

  // Create a test organization
  const organization = await prisma.organization.create({
    data: {
      name: `Test Organization ${accountId}`,
      slug: orgSlug,
      description: 'Test organization for integration testing',
      planName: tier, // Store tier in planName
      users: {
        create: {
          userId: user.id,
          organizationRoleId: adminRole.id,
        },
      },
    },
  });

  // Create an API key for the organization
  await prisma.apiKey.create({
    data: {
      key: accountId,
      name: `Test API Key for ${accountId}`,
      userId: user.id,
      organizationId: organization.id,
      isActive: true,
    },
  });

  return {
    account: {
      id: organization.id,
      accountId,
    },
    accountId,
    sharedSecret,
    userId: user.id,
    organizationId: organization.id,
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
 * @param organizationId - The organization ID
 * @param createdById - The user ID who created the template
 */
export async function createTestCardTemplate(organizationId: string, createdById: string) {
  const cardTemplate = await prisma.cardTemplate.create({
    data: {
      exId: `0xtest${Math.random().toString(36).substring(7)}`,
      organizationId,
      createdById,
      name: 'Test Card Template',
      platform: Platform.APPLE,
      useCase: UseCase.EMPLOYEE_BADGE,
      protocol: Protocol.DESFIRE,
      allowOnMultipleDevices: false,
      publishStatus: PublishStatus.DRAFT,
      backgroundColor: '#000000',
      labelColor: '#FFFFFF',
      metadata: JSON.stringify({
        description: 'Test card template for integration testing',
      }),
    },
  });

  return cardTemplate;
}

/**
 * Create a test access pass
 */
export async function createTestAccessPass(
  cardTemplateId: string,
  createdById: string,
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
      createdById,
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
      metadata: data.metadata ? JSON.stringify(data.metadata) : undefined,
    },
  });

  return accessPass;
}

/**
 * Clean up test organization and related data
 */
export async function cleanupTestAccount(organizationId: string) {
  const organization = await prisma.organization.findUnique({
    where: { id: organizationId },
    select: { id: true },
  });

  if (!organization) {
    return; // Organization doesn't exist, nothing to clean up
  }

  // Delete API keys
  await prisma.apiKey.deleteMany({
    where: { organizationId: organization.id },
  });

  // Delete webhook deliveries first
  const webhooks = await prisma.webhook.findMany({
    where: { organizationId: organization.id },
    select: { id: true },
  });

  for (const webhook of webhooks) {
    await prisma.webhookDelivery.deleteMany({
      where: { webhookId: webhook.id },
    });
  }

  // Delete webhooks
  await prisma.webhook.deleteMany({
    where: { organizationId: organization.id },
  });

  // Delete access passes and event logs
  const cardTemplates = await prisma.cardTemplate.findMany({
    where: { organizationId: organization.id },
    select: { id: true },
  });

  const cardTemplateIds = cardTemplates.map(ct => ct.id);

  // Delete event logs related to these card templates
  if (cardTemplateIds.length > 0) {
    await prisma.passEventLog.deleteMany({
      where: {
        OR: [
          { cardTemplateId: { in: cardTemplateIds } },
          {
            accessPass: {
              cardTemplate: {
                id: { in: cardTemplateIds }
              }
            }
          }
        ]
      },
    });

    // Delete access passes
    await prisma.accessPass.deleteMany({
      where: {
        cardTemplate: {
          organizationId: organization.id,
        },
      },
    });

    // Delete credential profiles
    await prisma.credentialProfile.deleteMany({
      where: {
        cardTemplate: {
          organizationId: organization.id,
        },
      },
    });

    // Delete card templates
    await prisma.cardTemplate.deleteMany({
      where: { organizationId: organization.id },
    });
  }

  // Delete user organization relationships
  await prisma.userOrganization.deleteMany({
    where: { organizationId: organization.id },
  });

  // Delete organization
  await prisma.organization.delete({
    where: { id: organization.id },
  });
}

/**
 * Create a published card template for wallet testing
 * @param organizationId - The organization ID
 * @param createdById - The user ID who created the template
 */
export async function createPublishedCardTemplate(organizationId: string, createdById: string) {
  const cardTemplate = await prisma.cardTemplate.create({
    data: {
      exId: `0xtest${Math.random().toString(36).substring(7)}`,
      organizationId,
      createdById,
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
      metadata: JSON.stringify({
        description: 'Published card template for wallet testing',
      }),
    },
  });

  return cardTemplate;
}
