import { invariantResponse } from '@epic-web/invariant'
import { prisma } from '#app/utils/db.server.ts'
import { type Route } from './+types/index.ts'
import { connect, getTransport } from './mcp.server.ts'

async function validateApiKey(apiKey: string) {
	const apiKeyRecord = await prisma.apiKey.findUnique({
		where: { key: apiKey },
		include: { user: true, organization: true },
	})

	if (!apiKeyRecord) return null

	return {
		user: apiKeyRecord.user,
		organization: apiKeyRecord.organization,
	}
}

export async function loader({ request }: Route.LoaderArgs) {
	// Check for API key in URL params or headers
	const url = new URL(request.url)
	const apiKey =
		url.searchParams.get('apiKey') ||
		request.headers.get('Authorization')?.replace('Bearer ', '') ||
		request.headers.get('X-API-Key')

	if (!apiKey) {
		throw new Response('API key required. Add ?apiKey=YOUR_KEY to the URL', {
			status: 401,
		})
	}

	// Validate API key and get user + organization
	const authData = await validateApiKey(apiKey)
	if (!authData) {
		throw new Response('Invalid API key', { status: 401 })
	}

	const sessionId = url.searchParams.get('sessionId')
	const transport = await connect(
		sessionId,
		authData.user.id,
		authData.organization.id,
	)
	return transport.handleSSERequest(request)
}

export async function action({ request }: Route.ActionArgs) {
	// Check for API key in URL params or headers
	const url = new URL(request.url)
	const apiKey =
		url.searchParams.get('apiKey') ||
		request.headers.get('Authorization')?.replace('Bearer ', '') ||
		request.headers.get('X-API-Key')

	if (!apiKey) {
		throw new Response('API key required. Add ?apiKey=YOUR_KEY to the URL', {
			status: 401,
		})
	}

	// Validate API key and get user + organization
	const authData = await validateApiKey(apiKey)
	if (!authData) {
		throw new Response('Invalid API key', { status: 401 })
	}

	const sessionId = url.searchParams.get('sessionId')

	// If no sessionId, create a new connection
	if (!sessionId) {
		const transport = await connect(
			null,
			authData.user.id,
			authData.organization.id,
		)
		return transport.handlePostMessage(request)
	}

	const transport = await getTransport(sessionId)
	invariantResponse(transport, 'No transport', { status: 404 })

	return transport.handlePostMessage(request)
}
