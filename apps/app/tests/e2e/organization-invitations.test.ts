import { faker } from '@faker-js/faker'
import { prisma } from '#app/utils/db.server.ts'
import {
	createTestOrganization,
	createTestOrganizationWithMultipleUsers,
} from '#tests/test-utils.ts'
// Removed prisma import - using test utilities instead
import { readEmail } from '#tests/mocks/utils.ts'
import { expect, test, waitFor } from '#tests/playwright-utils.ts'

test.describe('Organization Invitations', () => {
	test('Organization owners can send invitations', async ({ page, login }) => {
		const user = await login()

		// Create an organization for the user
		const org = await createTestOrganization(user.id, 'admin')

		// Navigate to organization members page
		await page.goto(`/${org.slug}/settings/members`)
		await page.waitForLoadState('networkidle')

		// Wait for page to fully load
		await page.waitForLoadState('networkidle')

		// Wait for and click invite member button with extended timeout
		const inviteButton = page.getByRole('button', { name: /invite member/i })
		await inviteButton.waitFor({ state: 'visible', timeout: 60000 })
		await page.waitForTimeout(1000) // Small delay to ensure button is clickable
		await inviteButton.click()

		// Fill in invitation form
		const inviteEmail = faker.internet.email()
		await page.getByRole('textbox', { name: /email/i }).fill(inviteEmail)
		await page.getByRole('combobox', { name: /role/i }).click()
		await page.getByRole('option', { name: 'MEMBER' }).click()

		// Send invitation
		await page.getByRole('button', { name: /send invitation/i }).click()

		// Verify success message
		await expect(page.getByText(/invitation sent/i)).toBeVisible()

		// Verify invitation exists in database
		const invitation = await prisma.organizationInvitation.findFirst({
			where: {
				organizationId: org.id,
				email: inviteEmail,
			},
		})
		expect(invitation).toBeTruthy()
		expect(invitation?.organizationRoleId).toBe('MEMBER')

		// Verify invitation email was sent
		await waitFor(
			async () => {
				const email = await readEmail(inviteEmail)
				expect(email).toBeTruthy()
				expect(email?.subject).toContain('invitation')
				return email
			},
			{ timeout: 10000 },
		)
	})

	test('Users can accept organization invitations', async ({ page, login }) => {
		const invitedUser = await login()

		// Create organization owner
		const owner = await prisma.user.create({
			data: {
				email: faker.internet.email(),
				username: faker.internet.username(),
				name: faker.person.fullName(),
				roles: { connect: { name: 'user' } },
			},
		})

		// Create an organization
		const org = await prisma.organization.create({
			data: {
				name: faker.company.name(),
				slug: faker.helpers.slugify(faker.company.name()).toLowerCase(),
				description: faker.company.catchPhrase(),
				users: {
					create: {
						userId: owner.id,
						organizationRoleId: 'org_role_admin',
					},
				},
			},
		})

		// Create an invitation for the logged-in user
		const invitation = await prisma.organizationInvitation.create({
			data: {
				organizationId: org.id,
				email: invitedUser.email,
		organizationRoleId: 'org_role_member',
				inviterId: owner.id,
				token: `accept-test-1-${faker.string.uuid()}-${Date.now()}`,
			},
		})

		// Navigate to invitation acceptance page
		await page.goto(`/join/${invitation.id}`)
		await page.waitForLoadState('networkidle')

		// Verify invitation details are displayed
		await expect(page.getByText(org.name)).toBeVisible()
		await expect(page.getByText(/invited to join/i)).toBeVisible()

		// Accept the invitation
		await page.getByRole('button', { name: /accept invitation/i }).click()

		// Verify user is redirected to organization
		await expect(page).toHaveURL(new RegExp(`/${org.slug}`))

		// Verify user is now a member in database
		const membership = await prisma.organization.findFirst({
			where: {
				id: org.id,
				users: {
					some: {
						userId: invitedUser.id,
					},
				},
			},
			select: {
				users: {
					where: {
						userId: invitedUser.id,
					},
					select: {
						organizationRoleId: true,
					},
				},
			},
		})
		expect(membership).toBeTruthy()
		expect(membership?.users[0]?.organizationRoleId).toBe('MEMBER')

		// Verify invitation is marked as accepted
		const updatedInvitation = await prisma.organizationInvitation.findUnique({
			where: { id: invitation.id },
		})
		expect(updatedInvitation?.createdAt).toBeTruthy()
	})

	test('Users can decline organization invitations', async ({
		page,
		login,
	}) => {
		const invitedUser = await login()

		// Create organization owner
		const owner = await prisma.user.create({
			data: {
				email: faker.internet.email(),
				username: faker.internet.username(),
				name: faker.person.fullName(),
				roles: { connect: { name: 'user' } },
			},
		})

		// Create an organization
		const org = await prisma.organization.create({
			data: {
				name: faker.company.name(),
				slug: faker.helpers.slugify(faker.company.name()).toLowerCase(),
				description: faker.company.catchPhrase(),
				users: {
					create: {
						userId: owner.id,
						organizationRoleId: 'org_role_admin',
					},
				},
			},
		})

		// Create an invitation for the logged-in user
		const invitation = await prisma.organizationInvitation.create({
			data: {
				organizationId: org.id,
				email: invitedUser.email,
				organizationRoleId: 'org_role_member',
				inviterId: owner.id,
				token: '',
			},
		})

		// Navigate to invitation acceptance page
		await page.goto(`/join/${invitation.id}`)
		await page.waitForLoadState('networkidle')

		// Decline the invitation
		await page.getByRole('button', { name: /decline/i }).click()

		// Verify user is redirected away
		await expect(page).toHaveURL('/')

		// Verify user is not a member in database
		const membership = await prisma.organization.findFirst({
			where: {
				id: org.id,
				users: {
					some: {
						userId: invitedUser.id,
					},
				},
			},
		})
		expect(membership).toBeNull()

		// Verify invitation is marked as declined
		const updatedInvitation = await prisma.organizationInvitation.findUnique({
			where: { id: invitation.id },
		})
		expect(updatedInvitation?.createdAt).toBeTruthy()
	})

	test('Organization owners can revoke pending invitations', async ({
		page,
		login,
	}) => {
		const user = await login()

		// Create an organization for the user
		const org = await createTestOrganization(user.id, 'admin')

		// Create a pending invitation
		const invitation = await prisma.organizationInvitation.create({
			data: {
				organizationId: org.id,
				email: faker.internet.email(),
				organizationRoleId: 'org_role_member',
				inviterId: user.id,
				token: '',
			},
		})

		// Navigate to organization members page
		await page.goto(`/${org.slug}/settings/members`)
		await page.waitForLoadState('networkidle')

		// Find and revoke the invitation
		const invitationRow = page.locator(
			`[data-testid="invitation-${invitation.id}"]`,
		)
		await invitationRow.getByRole('button', { name: /revoke/i }).click()

		// Confirm revocation
		await page.getByRole('button', { name: /confirm/i }).click()

		// Verify invitation is no longer displayed
		await expect(invitationRow).not.toBeVisible()

		// Verify invitation is deleted from database
		const deletedInvitation = await prisma.organizationInvitation.findUnique({
			where: { id: invitation.id },
		})
		expect(deletedInvitation).toBeNull()
	})

	test('Users can view their pending invitations', async ({ page, login }) => {
		const invitedUser = await login()

		// Create organization owner
		const owner = await prisma.user.create({
			data: {
				email: faker.internet.email(),
				username: faker.internet.username(),
				name: faker.person.fullName(),
				roles: { connect: { name: 'user' } },
			},
		})

		// Create multiple organizations with invitations
		const org1 = await prisma.organization.create({
			data: {
				name: faker.company.name(),
				slug: faker.helpers.slugify(faker.company.name()).toLowerCase(),
				description: faker.company.catchPhrase(),
				users: {
					create: {
						userId: owner.id,
						organizationRoleId: 'org_role_admin',
					},
				},
			},
		})

		const org2 = await prisma.organization.create({
			data: {
				name: faker.company.name(),
				slug: faker.helpers.slugify(faker.company.name()).toLowerCase(),
				description: faker.company.catchPhrase(),
				users: {
					create: {
						userId: owner.id,
						organizationRoleId: 'org_role_admin',
					},
				},
			},
		})

		// Create invitations for both organizations
		await prisma.organizationInvitation.createMany({
			data: [
				{
					organizationId: org1.id,
					email: invitedUser.email,
					organizationRoleId: 'org_role_member',
					inviterId: owner.id,
					token: '',
				},
				{
					organizationId: org2.id,
					email: invitedUser.email,
					organizationRoleId: 'org_role_admin',
					inviterId: owner.id,
					token: '',
				},
			],
		})

		// Navigate to organizations page
		await page.goto('/organizations')
		await page.waitForLoadState('networkidle')

		// Verify pending invitations section is displayed
		await expect(page.getByText(/pending invitations/i)).toBeVisible()

		// Verify both invitations are displayed
		await expect(page.getByText(org1.name)).toBeVisible()
		await expect(page.getByText(org2.name)).toBeVisible()

		// Verify roles are displayed
		await expect(page.getByText('MEMBER')).toBeVisible()
		await expect(page.getByText('ADMIN')).toBeVisible()
	})

	test('Expired invitations cannot be accepted', async ({ page, login }) => {
		const invitedUser = await login()

		// Create organization owner
		const owner = await prisma.user.create({
			data: {
				email: faker.internet.email(),
				username: faker.internet.username(),
				name: faker.person.fullName(),
				roles: { connect: { name: 'user' } },
			},
		})

		// Create an organization
		const org = await prisma.organization.create({
			data: {
				name: faker.company.name(),
				slug: faker.helpers.slugify(faker.company.name()).toLowerCase(),
				description: faker.company.catchPhrase(),
				users: {
					create: {
						userId: owner.id,
						organizationRoleId: 'org_role_admin',
					},
				},
			},
		})

		// Create an expired invitation (created 8 days ago)
		const expiredDate = new Date()
		expiredDate.setDate(expiredDate.getDate() - 8)

		const invitation = await prisma.organizationInvitation.create({
			data: {
				organizationId: org.id,
				email: invitedUser.email,
				organizationRoleId: 'org_role_member',
				inviterId: owner.id,
				createdAt: expiredDate,
				token: '',
			},
		})

		// Navigate to invitation acceptance page
		await page.goto(`/join/${invitation.id}`)
		await page.waitForLoadState('networkidle')

		// Verify expired message is displayed
		await expect(page.getByText(/invitation has expired/i)).toBeVisible()

		// Verify accept button is not available
		await expect(
			page.getByRole('button', { name: /accept invitation/i }),
		).not.toBeVisible()
	})

	test('Invalid invitation tokens show error message', async ({
		page,
		login,
	}) => {
		await login()

		// Navigate to invalid invitation page
		await page.goto('/join/invalid-token-123')
		await page.waitForLoadState('networkidle')

		// Verify error message is displayed
		await expect(page.getByText(/invitation not found/i)).toBeVisible()
	})
})
