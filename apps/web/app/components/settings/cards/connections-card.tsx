import { Connections } from '#app/components/settings/connections.tsx'
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@repo/ui'

export const disconnectProviderActionIntent = 'disconnect-provider'

interface ConnectionsCardProps {
	connections: Array<{
		id: string
		providerName: string
		providerId: string
		createdAt: Date
	}>
	user: {
		id: string
		name: string | null
		username: string
		email: string
	}
}

export function ConnectionsCard({ connections }: ConnectionsCardProps) {
	if (connections.length === 0) return null

	return (
		<Card className="w-full">
			<CardHeader>
				<CardTitle>Connected Accounts</CardTitle>
				<CardDescription>Manage your connected accounts here.</CardDescription>
			</CardHeader>
			<CardContent>
				<Connections data={{ connections }} />
			</CardContent>
		</Card>
	)
}
