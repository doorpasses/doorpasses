import { useState } from 'react'
import { useFetcher } from 'react-router'
import { IconTrash, IconRefresh, IconAlertTriangle } from '@tabler/icons-react'
import { Button } from '#app/components/ui/button'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '#app/components/ui/dialog'
import { Badge } from '#app/components/ui/badge'

interface CacheConfirmationDialogProps {
	isOpen: boolean
	onClose: () => void
	onConfirm: () => void
	title: string
	description: string
	confirmText: string
	variant?: 'destructive' | 'default'
	isLoading?: boolean
	details?: {
		type: string
		count?: number
		keys?: string[]
	}
}

export function CacheConfirmationDialog({
	isOpen,
	onClose,
	onConfirm,
	title,
	description,
	confirmText,
	variant = 'destructive',
	isLoading = false,
	details,
}: CacheConfirmationDialogProps) {
	const [confirmed, setConfirmed] = useState(false)

	const handleConfirm = () => {
		if (!confirmed) {
			setConfirmed(true)
			return
		}
		onConfirm()
	}

	const handleClose = () => {
		setConfirmed(false)
		onClose()
	}

	return (
		<Dialog open={isOpen} onOpenChange={handleClose}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<IconAlertTriangle className="h-5 w-5 text-destructive" />
						{title}
					</DialogTitle>
					<DialogDescription className="space-y-2">
						<p>{description}</p>
						{details && (
							<div className="space-y-2">
								<div className="flex items-center gap-2">
									<span className="text-sm font-medium">Cache Type:</span>
									<Badge variant="outline">{details.type.toUpperCase()}</Badge>
								</div>
								{details.count && (
									<div className="flex items-center gap-2">
										<span className="text-sm font-medium">Entries:</span>
										<Badge variant="secondary">{details.count}</Badge>
									</div>
								)}
								{details.keys && details.keys.length > 0 && (
									<div className="space-y-1">
										<span className="text-sm font-medium">Keys to delete:</span>
										<div className="max-h-32 overflow-y-auto space-y-1">
											{details.keys.slice(0, 10).map((key, index) => (
												<div key={index} className="text-xs font-mono bg-muted p-1 rounded">
													{key}
												</div>
											))}
											{details.keys.length > 10 && (
												<div className="text-xs text-muted-foreground">
													... and {details.keys.length - 10} more
												</div>
											)}
										</div>
									</div>
								)}
							</div>
						)}
					</DialogDescription>
				</DialogHeader>
				<DialogFooter className="flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
					<Button variant="outline" onClick={handleClose} disabled={isLoading}>
						Cancel
					</Button>
					<Button
						variant={variant}
						onClick={handleConfirm}
						disabled={isLoading}
						className="w-full sm:w-auto"
					>
						{isLoading ? (
							<>
								<IconRefresh className="mr-2 h-4 w-4 animate-spin" />
								Processing...
							</>
						) : (
							<>
								<IconTrash className="mr-2 h-4 w-4" />
								{confirmed ? confirmText : 'Confirm'}
							</>
						)}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}