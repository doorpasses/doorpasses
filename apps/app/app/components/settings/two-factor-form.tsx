import { getFormProps, getInputProps, useForm } from '@conform-to/react'
import { getZodConstraint, parseWithZod } from '@conform-to/zod'
import { useFetcher } from 'react-router'
import { z } from 'zod'
import { ErrorList, OTPField } from '#app/components/forms.tsx'

import {
	Button,
	StatusButton,
	Tabs,
	TabsList,
	TabsTrigger,
	TabsContent,
} from '@repo/ui'
import { enable2FAActionIntent } from '#app/routes/_app+/security.tsx'
import { disable2FAActionIntent } from './cards/security-card'

export const Enable2FASchema = z.object({
	code: z.string().min(6).max(6),
})

export function TwoFactorForm({
	isTwoFactorEnabled,
	qrCode,
	otpUri,
	setIsOpen,
}: {
	isTwoFactorEnabled: boolean
	qrCode: string | null
	otpUri: string | null
	setIsOpen: (open: boolean) => void
}) {
	const fetcher = useFetcher()

	const [form, fields] = useForm({
		id: 'two-factor-form',
		constraint: getZodConstraint(Enable2FASchema),
		lastResult: fetcher.data?.result,
		onValidate({ formData }) {
			return parseWithZod(formData, { schema: Enable2FASchema })
		},
	})

	if (fetcher.data?.status === 'success') {
		setIsOpen(false)
	}

	if (isTwoFactorEnabled) {
		return (
			<fetcher.Form method="POST">
				<input type="hidden" name="intent" value={disable2FAActionIntent} />
				<p className="mb-4 text-sm">
					Two-factor authentication is currently enabled. Disabling it will make
					your account less secure.
				</p>
				<div className="flex justify-end gap-2">
					<Button
						type="button"
						variant="secondary"
						onClick={() => setIsOpen(false)}
					>
						Cancel
					</Button>
					<StatusButton
						type="submit"
						variant="destructive"
						status={fetcher.state !== 'idle' ? 'pending' : 'idle'}
					>
						Disable 2FA
					</StatusButton>
				</div>
			</fetcher.Form>
		)
	}

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="space-y-2">
				<h2 className="text-xl font-semibold">
					Complete two-factor authentication setup
				</h2>
				<p className="text-muted-foreground text-sm">
					Complete the following steps.
				</p>
			</div>

			{/* Step 1: QR Code or Setup Key */}
			<div className="flex gap-4">
				<div className="flex-shrink-0">
					<div className="bg-primary text-primary-foreground flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium">
						1
					</div>
				</div>
				<div className="flex-1 space-y-3">
					<div>
						<h3 className="font-medium">Scan QR Code or Enter Setup Key</h3>
						<p className="text-muted-foreground text-sm">
							Use any authenticator app on your mobile device to scan the QR
							code, or enter the Setup Key manually.
						</p>
					</div>

					{qrCode && (
						<Tabs defaultValue="qr-code" className="w-full">
							<TabsList className="grid w-full grid-cols-2">
								<TabsTrigger value="qr-code">QR code</TabsTrigger>
								<TabsTrigger value="setup-key">Setup key</TabsTrigger>
							</TabsList>
							<TabsContent value="qr-code" className="mt-4">
								<div className="flex justify-center">
									<img alt="qr code" src={qrCode} className="h-48 w-48" />
								</div>
							</TabsContent>
							<TabsContent value="setup-key" className="mt-4">
								{otpUri && (
									<div className="bg-muted rounded-md p-4">
										<pre className="font-mono text-xs break-all whitespace-pre-wrap">
											{otpUri}
										</pre>
									</div>
								)}
							</TabsContent>
						</Tabs>
					)}
				</div>
			</div>

			{/* Step 2: Enter OTP Token */}
			<div className="flex gap-4">
				<div className="flex-shrink-0">
					<div className="bg-primary text-primary-foreground flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium">
						2
					</div>
				</div>
				<div className="flex-1 space-y-3">
					<div>
						<h3 className="font-medium">Enter 6-digit OTP token</h3>
						<p className="text-muted-foreground text-sm">
							Enter the 6-digit one time password (OTP) token that your
							authentication app provides you.
						</p>
					</div>

					<fetcher.Form
						method="POST"
						{...getFormProps(form)}
						className="space-y-4"
					>
						<input type="hidden" name="intent" value={enable2FAActionIntent} />

						<div className="flex justify-start">
							<OTPField
								labelProps={{
									htmlFor: fields.code.id,
									children: 'Authentication Code',
									className: 'sr-only'
								}}
								inputProps={{
									...getInputProps(fields.code, { type: 'text' }),
									autoFocus: true,
									autoComplete: 'one-time-code',
								}}
								errors={fields.code.errors}
							/>
						</div>

						<ErrorList id={form.errorId} errors={form.errors} />

						<div className="flex justify-end gap-2 pt-4">
							<Button
								type="button"
								variant="outline"
								onClick={() => setIsOpen(false)}
							>
								Cancel
							</Button>
							<StatusButton
								type="submit"
								status={
									fetcher.state !== 'idle' ? 'pending' : (form.status ?? 'idle')
								}
							>
								Confirm
							</StatusButton>
						</div>
					</fetcher.Form>
				</div>
			</div>
		</div>
	)
}
