import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { type CallToolResult } from '@modelcontextprotocol/sdk/types.js'
import { z } from 'zod'
import { prisma } from '#app/utils/db.server.ts'
import { getSignedGetRequestInfo } from '#app/utils/storage.server.ts'
import { FetchSSEServerTransport } from './fetch-transport.server.ts'

function createUserScopedServer(userId?: string, organizationId?: string) {
	const userServer = new McpServer(
		{
			name: 'epic-mcp-a25d',
			version: '1.0.0',
		},
		{
			capabilities: {
				tools: {},
			},
		},
	)

	// User search tool - scoped to organization
	userServer.tool(
		'find_user',
		'Search for users in your organization by their name or username',
		{ query: z.string().describe('The query to search for') },
		async ({ query }) => {
			if (!organizationId) {
				return {
					content: [
						{ type: 'text', text: 'No organization context available' },
					],
				}
			}

			// Find users in the same organization
			const users = await prisma.user.findMany({
				where: {
					organizations: {
						some: {
							organizationId: organizationId,
							active: true,
						},
					},
					OR: [
						{ name: { contains: query } },
						{ username: { contains: query } },
					],
				},
				select: {
					name: true,
					username: true,
					image: {
						select: {
							objectKey: true,
						},
					},
				},
				take: 10,
			})

			const content: CallToolResult['content'] = []
			for (const user of users) {
				content.push({
					type: 'text',
					text: `${user.name} (${user.username})`,
				})

				if (user.image?.objectKey) {
					content.push({
						type: 'image',
						data: await getUserBase64Image(user.image.objectKey),
						mimeType: 'image/png',
					})
				}
			}

			if (!content.length) {
				return {
					content: [
						{ type: 'text', text: 'No users found in your organization' },
					],
				}
			}

			return { content }
		},
	)

	// Notes tool - scoped to organization
	userServer.tool(
		'get_user_notes',
		'Get the notes for a user in your organization',
		{
			username: z
				.string()
				.describe('The username of the user to get notes for'),
		},
		async ({ username }) => {
			if (!organizationId) {
				return {
					content: [
						{ type: 'text', text: 'No organization context available' },
					],
				}
			}

			// Find user in the same organization
			const user = await prisma.user.findFirst({
				where: {
					username,
					organizations: {
						some: {
							organizationId: organizationId,
							active: true,
						},
					},
				},
				select: {
					id: true,
					name: true,
					username: true,
				},
			})

			if (!user) {
				return {
					content: [
						{ type: 'text', text: 'User not found in your organization' },
					],
				}
			}

			// Get organization notes created by this user
			const notes = await prisma.organizationNote.findMany({
				where: {
					organizationId: organizationId,
					createdById: user.id,
					// Only public notes or notes the requesting user has access to
					OR: [
						{ isPublic: true },
						{ createdById: userId },
						{ noteAccess: { some: { userId: userId } } },
					],
				},
				select: {
					id: true,
					title: true,
					content: true,
					createdAt: true,
					isPublic: true,
				},
				take: 10,
				orderBy: { createdAt: 'desc' },
			})

			if (!notes?.length) {
				return {
					content: [
						{
							type: 'text',
							text: `No accessible notes found for ${user.name}`,
						},
					],
				}
			}

			return {
				content: notes.map((note) => ({
					type: 'text',
					text: `${note.title}\n\n${note.content}\n\n---\nCreated: ${note.createdAt.toLocaleDateString()}${note.isPublic ? '' : ' (Private)'}`,
				})),
			}
		},
	)

	return userServer
}

export const server = new McpServer(
	{
		name: 'epic-mcp-a25d',
		version: '1.0.0',
	},
	{
		capabilities: {
			tools: {},
		},
	},
)

async function getUserBase64Image(imageObjectKey: string) {
	const { url: signedUrl, headers: signedHeaders } =
		getSignedGetRequestInfo(imageObjectKey)
	const response = await fetch(signedUrl, { headers: signedHeaders })
	const blob = await response.blob()
	const buffer = await blob.arrayBuffer()
	return Buffer.from(buffer).toString('base64')
}

const transports = new Map<
	string,
	{ transport: FetchSSEServerTransport; userId: string; organizationId: string }
>()

export async function connect(
	sessionId?: string | null,
	userId?: string,
	organizationId?: string,
) {
	const transport = new FetchSSEServerTransport('/mcp', sessionId)
	transport.onclose = () => {
		transports.delete(transport.sessionId)
	}

	// Create a user-scoped server instance
	const userScopedServer = createUserScopedServer(userId, organizationId)
	await userScopedServer.connect(transport)

	transports.set(transport.sessionId, {
		transport,
		userId: userId || 'anonymous',
		organizationId: organizationId || 'none',
	})
	return transport
}

export async function getTransport(sessionId: string) {
	return transports.get(sessionId)?.transport
}
