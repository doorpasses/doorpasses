import { Form } from 'react-router'
import { Button } from '#app/components/ui/button'
import { Icon } from '#app/components/ui/icon.tsx'
import { type ImpersonationInfo } from '#app/utils/impersonation.server.ts'

interface ImpersonationBannerProps {
	impersonationInfo: ImpersonationInfo
}

export function ImpersonationBanner({ impersonationInfo }: ImpersonationBannerProps) {
	const startedAt = new Date(impersonationInfo.startedAt)
	const duration = Math.floor((Date.now() - startedAt.getTime()) / 1000 / 60) // minutes

	return (
		<div className="bg-yellow-50 border-b border-yellow-200 px-4 py-3">
			<div className="flex items-center justify-between max-w-7xl mx-auto">
				<div className="flex items-center gap-3">
					<div className="flex items-center gap-2 text-yellow-800">
						<Icon name="alert-triangle" className="h-5 w-5" />
						<Icon name="user" className="h-4 w-4" />
					</div>
					<div className="text-sm">
						<span className="font-medium text-yellow-900">
							Admin Impersonation Active
						</span>
						<span className="text-yellow-700 ml-2">
							You are impersonating <strong>{impersonationInfo.targetName}</strong>
						</span>
						<span className="text-yellow-600 ml-2">
							({duration} minute{duration !== 1 ? 's' : ''} ago)
						</span>
					</div>
				</div>
				<Form method="post" action="/admin/stop-impersonation">
					<Button
						type="submit"
						variant="outline"
						size="sm"
						className="bg-white border-yellow-300 text-yellow-800 hover:bg-yellow-50 hover:border-yellow-400"
					>
						<Icon name="x" className="h-4 w-4 mr-1" />
						Stop Impersonation
					</Button>
				</Form>
			</div>
		</div>
	)
}