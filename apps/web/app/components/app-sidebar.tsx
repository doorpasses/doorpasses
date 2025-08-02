import * as React from 'react'

import { useLocation, useRouteLoaderData, Link } from 'react-router'
import { motion, AnimatePresence } from 'motion/react'
import { FoldersIcon } from '#app/components/icons/folders-icon'
import { HomeIcon } from '#app/components/icons/home-icon'
import { SettingsGearIcon } from '#app/components/icons/settings-gear-icon'
import { UserIcon } from '#app/components/icons/user-icon'
import { NavMain } from '#app/components/nav-main'
import { NavUser } from '#app/components/nav-user'
import { OnboardingChecklist } from '#app/components/onboarding-checklist'
import { TeamSwitcher } from '#app/components/team-switcher'
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
} from '#app/components/ui/sidebar'
import { type loader as rootLoader } from '#app/root.tsx'
import { type OnboardingProgressData } from '#app/utils/onboarding'
import { CircleHelpIcon } from './icons/circle-help'
import { MessageSquareMoreIcon } from './icons/message-square-more'
import { NavSecondary } from './nav-secondary'
import { UserRoundPlusIcon } from './icons/user-round-plus'
import { Logo } from './icons/logo'
import FavoriteNotes from './favorite-notes'
import { FeatureUpdates } from './feature-updates'
import { ArrowLeftIcon } from './icons/arrow-left-icon'
import { BuildingIcon } from './icons/building-icon'

// Account Sidebar Component
function AccountSidebar({
	user,
	location,
	orgSlug
}: {
	user: any
	location: any
	orgSlug: string | undefined
}) {
	const isProfileRoute = location.pathname === '/app/profile'
	const isOrganizationsRoute = location.pathname === '/app/organizations'

	const navMain = [
		{
			title: 'Dashboard',
			url: orgSlug ? `/app/${orgSlug}` : '/app/organizations',
			isActive: false,
			icon: ArrowLeftIcon,
		},
		{
			title: 'Profile',
			url: '/app/profile',
			isActive: isProfileRoute,
			icon: UserIcon,
		},
		{
			title: 'Organizations',
			url: '/app/organizations',
			isActive: isOrganizationsRoute,
			icon: BuildingIcon,
		},
	]

	const navSecondary = [
		{
			title: 'Get help',
			url: '#',
			icon: CircleHelpIcon,
		},
		{
			title: 'Give feedback',
			url: '#',
			icon: MessageSquareMoreIcon,
		},
	]

	return (
		<>
			<SidebarHeader className="space-y-4 p-2">
				{/* Empty header for account routes */}
			</SidebarHeader>

			<SidebarContent>
				<NavMain items={navMain} />
			</SidebarContent>
		</>
	)
}

// Organization Sidebar Component
function OrganizationSidebar({
	user,
	location,
	onboardingProgress,
	orgSlug,
	organizationId,
	favoriteNotes,
	setHasVisibleFeatureUpdates,
	hasVisibleFeatureUpdates
}: {
	user: any
	location: any
	onboardingProgress: OnboardingProgressData | null
	orgSlug: string | undefined
	organizationId: string | undefined
	favoriteNotes: any
	setHasVisibleFeatureUpdates: (value: boolean) => void
	hasVisibleFeatureUpdates: boolean
}) {
	const navMain = [
		{
			title: 'Dashboard',
			url: `/app/${orgSlug}`,
			isActive: location.pathname === `/app/${orgSlug}`,
			icon: HomeIcon,
		},
		{
			title: 'Notes',
			url: `/app/${orgSlug}/notes`,
			isActive: location.pathname.includes(`/app/${orgSlug}/notes`),
			icon: FoldersIcon,
		},
		{
			title: 'Settings',
			url: `/app/${orgSlug}/settings`,
			isActive: location.pathname.includes(`/app/${orgSlug}/settings`),
			icon: SettingsGearIcon,
			items: [
				{
					title: 'General',
					url: `/app/${orgSlug}/settings`,
					isActive: location.pathname === `/app/${orgSlug}/settings`,
				},
				{
					title: 'Members',
					url: `/app/${orgSlug}/settings/members`,
					isActive: location.pathname === `/app/${orgSlug}/settings/members`,
				},
				{
					title: 'Integrations',
					url: `/app/${orgSlug}/settings/integrations`,
					isActive: location.pathname === `/app/${orgSlug}/settings/integrations`,
				},
				{
					title: 'Billing',
					url: `/app/${orgSlug}/settings/billing`,
					isActive: location.pathname === `/app/${orgSlug}/settings/billing`,
				},
			],
		},
	]

	const navSecondary = [
		{
			title: 'Add members',
			url: `/app/${orgSlug}/settings/members`,
			icon: UserRoundPlusIcon,
		},
		{
			title: 'Get help',
			url: '#',
			icon: CircleHelpIcon,
		},
		{
			title: 'Give feedback',
			url: '#',
			icon: MessageSquareMoreIcon,
		},
	]

	return (
		<>
			<SidebarHeader className="space-y-4 p-2">
				<Logo className="pl-6 mb-0" />
				<TeamSwitcher />
			</SidebarHeader>

			<SidebarContent>
				{/* Onboarding Checklist */}
				{onboardingProgress &&
					!onboardingProgress.isCompleted &&
					onboardingProgress.isVisible &&
					orgSlug &&
					organizationId && (
						<Link to={`/app/${orgSlug}`}>
							<OnboardingChecklist
								progress={onboardingProgress}
								orgSlug={orgSlug}
								organizationId={organizationId}
								variant="sidebar"
							/>
						</Link>
					)}

				<NavMain items={navMain} />

				{/* Favorite Notes */}
				{favoriteNotes && orgSlug && (
					<FavoriteNotes
						favoriteNotes={favoriteNotes}
						orgSlug={orgSlug}
					/>
				)}

				{/* Feature Updates */}
				<FeatureUpdates
					className="mt-auto"
					onVisibilityChange={setHasVisibleFeatureUpdates}
				/>

				{/* NavSecondary */}
				<NavSecondary
					items={navSecondary}
					className={hasVisibleFeatureUpdates ? '' : 'mt-auto'}
				/>
			</SidebarContent>

			<SidebarFooter>
				<NavUser user={user} />
			</SidebarFooter>
		</>
	)
}

export function AppSidebar({
	onboardingProgress,
	...props
}: React.ComponentProps<typeof Sidebar> & {
	onboardingProgress?: OnboardingProgressData | null
}) {
	const rootData = useRouteLoaderData<typeof rootLoader>('root')
	const location = useLocation()
	const [hasVisibleFeatureUpdates, setHasVisibleFeatureUpdates] =
		React.useState(true)

	const orgSlug =
		rootData?.userOrganizations?.currentOrganization?.organization.slug
	const organizationId =
		rootData?.userOrganizations?.currentOrganization?.organization.id

	// Check if we're on profile or organizations routes
	const isProfileRoute = location.pathname === '/app/profile'
	const isOrganizationsRoute = location.pathname === '/app/organizations'
	const isAccountRoute = isProfileRoute || isOrganizationsRoute

	const userData = rootData?.user
		? {
			name: rootData.user.name || rootData.user.username || 'User',
			email: rootData.user.username,
			avatar: rootData.user.image
				? `/resources/images?objectKey=${rootData.user.image.objectKey}`
				: '/avatars/user.jpg',
			roles: rootData.user.roles,
		}
		: {
			name: 'Guest',
			email: '',
			avatar: '/avatars/user.jpg',
			roles: [],
		}

	return (
		<Sidebar collapsible="offcanvas" {...props} className="overflow-hidden">
			<div className="relative h-full">
				{/* Account Sidebar */}
				<motion.div
					animate={{
						x: isAccountRoute ? 0 : -300,
						opacity: isAccountRoute ? 1 : 0
					}}
					transition={{
						duration: 0.4,
						ease: [0.4, 0, 0.2, 1],
						opacity: { duration: 0.3 }
					}}
					className="absolute inset-0 flex h-full flex-col"
					style={{ pointerEvents: isAccountRoute ? 'auto' : 'none' }}
				>
					<AccountSidebar user={userData} location={location} orgSlug={orgSlug} />
				</motion.div>

				{/* Organization Sidebar */}
				<motion.div
					animate={{
						x: !isAccountRoute ? 0 : 300,
						opacity: !isAccountRoute ? 1 : 0
					}}
					transition={{
						duration: 0.4,
						ease: [0.4, 0, 0.2, 1],
						opacity: { duration: 0.3 }
					}}
					className="absolute inset-0 flex h-full flex-col"
					style={{ pointerEvents: !isAccountRoute ? 'auto' : 'none' }}
				>
					<OrganizationSidebar
						user={userData}
						location={location}
						onboardingProgress={onboardingProgress}
						orgSlug={orgSlug}
						organizationId={organizationId}
						favoriteNotes={rootData?.favoriteNotes}
						setHasVisibleFeatureUpdates={setHasVisibleFeatureUpdates}
						hasVisibleFeatureUpdates={hasVisibleFeatureUpdates}
					/>
				</motion.div>
			</div>
		</Sidebar>
	)
}
