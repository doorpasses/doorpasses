import { getPageTitle } from '@repo/config/brand'
import { redirect } from 'react-router'
import { requireUserId } from '#app/utils/auth.server.ts'
import { prisma } from '#app/utils/db.server.ts'
import { getLaunchStatus } from '#app/utils/env.server.ts'
import { type Route } from './+types/waitlist.ts'
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
	Icon,
} from '@repo/ui'

export async function loader({ request }: Route.LoaderArgs) {
	const userId = await requireUserId(request)
	const user = await prisma.user.findUnique({
		where: { id: userId },
		select: { email: true, name: true },
	})

	if (!user) {
		throw redirect('/login')
	}

	// If launch status is not CLOSED_BETA, redirect to organizations
	const launchStatus = getLaunchStatus()
	if (launchStatus !== 'CLOSED_BETA') {
		throw redirect('/organizations')
	}

	return { user }
}

export function meta() {
	return [{ title: getPageTitle('You are on the Waitlist') }]
}

export default function WaitlistPage({ loaderData }: Route.ComponentProps) {
	const { user } = loaderData

	return (
		<Card className="w-full max-w-md mx-auto bg-white/95 backdrop-blur">
			<CardHeader className="text-center">
				<div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
					<Icon name="check" className="h-8 w-8 text-green-600" />
				</div>
				<CardTitle className="text-2xl font-bold">
					You're on the Waitlist!
				</CardTitle>
				<CardDescription className="text-base">
					Thank you for your interest, {user.name}
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="rounded-lg bg-muted p-4 text-center">
					<p className="text-sm text-muted-foreground">
						We're currently in closed beta and carefully onboarding new users.
					</p>
				</div>
				<div className="space-y-2">
					<p className="text-sm">
						We've registered your interest and will send you an email at{' '}
						<span className="font-semibold">{user.email}</span> when we're ready
						to welcome you.
					</p>
					<p className="text-sm text-muted-foreground">
						We appreciate your patience and look forward to having you join us
						soon!
					</p>
				</div>
			</CardContent>
		</Card>
	)
}
