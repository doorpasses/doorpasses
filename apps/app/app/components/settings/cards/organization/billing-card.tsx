import { type Organization } from '@prisma/client'
import { Form, Link } from 'react-router'
import { useState, useEffect } from 'react'

import { type getPlansAndPrices } from '#app/utils/payments.server.ts'
import {
	Badge,
	Button,
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
	Icon,
} from '@repo/ui'

const PLANS = {
	Base: {
		name: 'Base plan',
		seats: 3,
		price: 7.99,
		additionalSeatPrice: 4.99,
	},
	Plus: {
		name: 'Plus plan',
		seats: 5,
		price: 49.99,
		additionalSeatPrice: 9.99,
	},
}

type BillingCardProps = {
	organization: Pick<
		Organization,
		| 'id'
		| 'name'
		| 'slug'
		| 'stripeCustomerId'
		| 'stripeSubscriptionId'
		| 'stripeProductId'
		| 'planName'
		| 'subscriptionStatus'
	> & {
		_count?: {
			users: number
		}
	}
	plansAndPrices?: Awaited<ReturnType<typeof getPlansAndPrices>> | null
	isClosedBeta?: boolean
}

export function BillingCard({
	organization,
	plansAndPrices,
	isClosedBeta,
	currentPriceId,
}: BillingCardProps & { currentPriceId?: string | null }) {
	const [billingInterval, setBillingInterval] = useState<'monthly' | 'yearly'>('monthly')

	// Update billing interval when data becomes available
	useEffect(() => {
		if (currentPriceId && plansAndPrices) {
			const isYearly =
				currentPriceId === plansAndPrices.prices.base?.yearly?.id ||
				currentPriceId === plansAndPrices.prices.plus?.yearly?.id

			setBillingInterval(isYearly ? 'yearly' : 'monthly')
		}
	}, [currentPriceId, plansAndPrices])

	console.log('plansAndPrices', plansAndPrices)
	console.log('plansAndPrices.prices:', plansAndPrices?.prices)
	console.log('billingInterval:', billingInterval)
	console.log('Base price for', billingInterval, ':', plansAndPrices?.prices.base?.[billingInterval])
	console.log('Plus price for', billingInterval, ':', plansAndPrices?.prices.plus?.[billingInterval])

	if (isClosedBeta) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Billing & Subscription</CardTitle>
					<CardDescription>
						Manage your organization's subscription
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="py-8 text-center">
						<div className="mb-4">
							<Badge variant="secondary" className="text-sm">
								Beta Access
							</Badge>
						</div>
						<p className="text-muted-foreground">
							You are covered during our beta phase. No billing required at this
							time.
						</p>
					</div>
				</CardContent>
			</Card>
		)
	}

	return (
		<div className="space-y-6">
			{/* Current Subscription Status */}
			<Card>
				<CardHeader>
					<CardTitle>Current Subscription</CardTitle>
					<CardDescription>
						Your organization's current plan and billing status
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
						<div>
							<div className="mb-2 flex items-center gap-2">
								<h3 className="text-lg font-medium">
									{organization.planName || 'Free Plan'}
								</h3>
								{organization.subscriptionStatus && (
									<Badge
										variant={
											organization.subscriptionStatus === 'active'
												? 'default'
												: organization.subscriptionStatus === 'trialing'
													? 'secondary'
													: 'destructive'
										}
									>
										{organization.subscriptionStatus === 'active'
											? 'Active'
											: organization.subscriptionStatus === 'trialing'
												? 'Trial'
												: organization.subscriptionStatus}
									</Badge>
								)}
							</div>
							<p className="text-muted-foreground text-sm">
								{organization.subscriptionStatus === 'active'
									? 'Billed monthly'
									: organization.subscriptionStatus === 'trialing'
										? 'Trial period active'
										: organization.stripeCustomerId
											? 'Subscription inactive'
											: 'No active subscription'}
							</p>
							{organization._count?.users && (
								<p className="text-muted-foreground mt-1 text-sm">
									{organization._count.users} active member
									{organization._count.users !== 1 ? 's' : ''}
								</p>
							)}
						</div>
						<div className="flex gap-2">
							{organization.stripeCustomerId ? (
								<Form method="post">
									<input type="hidden" name="intent" value="customer-portal" />
									<Button type="submit" variant="outline">
										Manage Subscription
									</Button>
								</Form>
							) : (
								<Button asChild>
									<Link to={`/pricing?orgSlug=${organization.slug}`}>
										Subscribe
									</Link>
								</Button>
							)}
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Billing Interval Toggle */}
			{plansAndPrices && (
				<div className="flex items-center justify-end">
					<div className="flex items-center space-x-2 rounded-lg bg-muted p-1">
						<button
							onClick={() => setBillingInterval('monthly')}
							className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${billingInterval === 'monthly'
								? 'bg-background text-foreground shadow-sm'
								: 'text-muted-foreground hover:text-foreground'
								}`}
						>
							Monthly
						</button>
						<button
							onClick={() => setBillingInterval('yearly')}
							className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${billingInterval === 'yearly'
								? 'bg-background text-foreground shadow-sm'
								: 'text-muted-foreground hover:text-foreground'
								}`}
						>
							Yearly
							<Badge variant="secondary" className="ml-2 text-xs">
								Save 20%
							</Badge>
						</button>
					</div>
				</div>
			)}

			{/* Available Plans */}
			{plansAndPrices ? (
				<div className="grid gap-6 lg:grid-cols-2">
					<PricingPlan
						title={PLANS.Base.name}
						stripePrice={plansAndPrices.prices.base?.[billingInterval]}
						includesSeats={PLANS.Base.seats}
						billingInterval={billingInterval}
						currentPlan={
							currentPriceId === plansAndPrices?.prices.base?.[billingInterval]?.id
						}
						priceId={plansAndPrices?.prices.base?.[billingInterval]?.id}
					/>
					<PricingPlan
						title={PLANS.Plus.name}
						stripePrice={plansAndPrices.prices.plus?.[billingInterval]}
						includesSeats={PLANS.Plus.seats}
						billingInterval={billingInterval}
						currentPlan={
							currentPriceId === plansAndPrices?.prices.plus?.[billingInterval]?.id
						}
						priceId={plansAndPrices?.prices.plus?.[billingInterval]?.id}
					/>
				</div>
			) : (
				<Card>
					<CardContent className="p-6">
						<div className="text-center text-muted-foreground">
							<p>Unable to load pricing information</p>
							<p className="text-sm">Please check your Stripe configuration or try again later</p>
						</div>
					</CardContent>
				</Card>
			)}

			{/* Enterprise Plan */}
			<Card>
				<CardContent>
					<div className="flex items-center justify-between">
						<div>
							<h3 className="mb-2 font-semibold">Enterprise Plan</h3>
							<p className="text-muted-foreground text-sm">
								Single sign-on, custom SLA, private support channel, and more.{' '}
								<Link to="/contact" className="text-primary hover:underline">
									Learn more
								</Link>
							</p>
						</div>
						<Button variant="outline" asChild>
							<Link to="/contact?subject=Enterprise">Schedule a call</Link>
						</Button>
					</div>
				</CardContent>
			</Card>

			{/* Help Section */}
			<Card>
				<CardContent>
					<div className="flex items-center justify-between">
						<div className="text-muted-foreground text-sm">
							Questions about billing?
						</div>
						<Button variant="link" className="text-sm" asChild>
							<Link to="/support">Get in touch</Link>
						</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	)
}

function PricingPlan({
	title,
	stripePrice,
	includesSeats,
	billingInterval,
	currentPlan,
	priceId,
}: {
	title: string
	stripePrice?: {
		id: string
		productId: string
		unitAmount: number | null
		currency: string
		interval: string | null | undefined
		trialPeriodDays: number | null | undefined
		tiers?: Array<{
			flat_amount: number | null
			unit_amount: number | null
			up_to: number | null
		}>
	}
	includesSeats: number
	billingInterval: 'monthly' | 'yearly'
	currentPlan?: boolean
	priceId?: string
}) {
	console.log('PricingPlan stripePrice:', stripePrice)

	if (!stripePrice) {
		console.log('No stripePrice provided')
		return (
			<Card>
				<CardContent className="p-6">
					<div className="text-center text-muted-foreground">
						<p>Pricing not available</p>
						<p className="text-sm">Please check your Stripe configuration</p>
					</div>
				</CardContent>
			</Card>
		)
	}

	// Handle tiered pricing - get the base price from the first tier's flat_amount
	let basePrice = 0
	let additionalUserPrice = 0

	if (stripePrice.unitAmount) {
		// Standard pricing
		basePrice = stripePrice.unitAmount / 100
	} else if ((stripePrice as any).tiers && (stripePrice as any).tiers.length > 0) {
		// Tiered pricing - use the first tier's flat_amount
		const firstTier = (stripePrice as any).tiers[0]
		const secondTier = (stripePrice as any).tiers[1]

		if (firstTier?.flat_amount) {
			basePrice = firstTier.flat_amount / 100
		}

		// Get additional user pricing from second tier
		if (secondTier?.unit_amount) {
			additionalUserPrice = secondTier.unit_amount / 100
		}
	}

	if (basePrice === 0) {
		console.log('No pricing found in stripePrice:', stripePrice)
		return (
			<Card>
				<CardContent className="p-6">
					<div className="text-center text-muted-foreground">
						<p>Price not configured</p>
						<p className="text-sm">Contact support for pricing</p>
					</div>
				</CardContent>
			</Card>
		)
	}

	const displayPrice = billingInterval === 'yearly' ? basePrice / 12 : basePrice
	return (
		<Card className={currentPlan ? 'ring-primary ring-2' : ''}>
			<CardHeader>
				<div className="flex items-baseline gap-2">
					<CardTitle className="text-2xl font-bold">
						${displayPrice.toFixed(2)}
					</CardTitle>
					<span className="text-muted-foreground text-sm">per month</span>
				</div>
				{billingInterval === 'yearly' && (
					<div className="text-sm text-muted-foreground">
						${basePrice.toFixed(2)} billed annually
					</div>
				)}
				<CardDescription>{title}</CardDescription>
			</CardHeader>
			<CardContent>
				<ul className="text-muted-foreground mb-4 space-y-2 text-sm">
					<li>Includes {includesSeats} user seats</li>
					{additionalUserPrice > 0 && (
						<li>
							Additional users: ${billingInterval === 'yearly' ? (additionalUserPrice / 12).toFixed(2) : additionalUserPrice.toFixed(2)}/user/month
							{billingInterval === 'yearly' && (
								<span className="block text-xs opacity-75">
									(${additionalUserPrice.toFixed(2)} billed annually per user)
								</span>
							)}
						</li>
					)}
				</ul>

				<Form method="post">
					<input type="hidden" name="intent" value="upgrade" />
					<input type="hidden" name="priceId" value={priceId} />
					<Button
						disabled={currentPlan}
						variant={currentPlan ? 'outline' : 'default'}
						type="submit"
						className="w-full"
					>
						{currentPlan ? (
							<>
								<Icon name="check" className="h-4 w-4" /> Current Plan
							</>
						) : (
							'Upgrade'
						)}
					</Button>
				</Form>
			</CardContent>
		</Card>
	)
}
