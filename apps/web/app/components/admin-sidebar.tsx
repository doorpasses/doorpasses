import * as React from 'react'
import { useLocation, useRouteLoaderData } from 'react-router'
import { HomeIcon } from '#app/components/icons/home-icon'
import { UserIcon } from '#app/components/icons/user-icon'
import { BuildingIcon } from '#app/components/icons/building-icon'
import { SettingsGearIcon } from '#app/components/icons/settings-gear-icon'
import { IconShield } from '@tabler/icons-react'
import { NavMain } from '#app/components/nav-main'
import { NavUser } from '#app/components/nav-user'
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
} from '#app/components/ui/sidebar'
import { type loader as rootLoader } from '#app/root.tsx'
import { Logo } from './icons/logo'

export function AdminSidebar({
	...props
}: React.ComponentProps<typeof Sidebar>) {
	const rootData = useRouteLoaderData<typeof rootLoader>('root')
	const location = useLocation()

	// Admin navigation items
	const navMain = [
		{
			title: 'Dashboard',
			url: '/admin',
			isActive: location.pathname === '/admin',
			icon: HomeIcon,
		},
		{
			title: 'Users',
			url: '/admin/users',
			isActive: location.pathname.startsWith('/admin/users'),
			icon: UserIcon,
		},
		{
			title: 'Organizations',
			url: '/admin/organizations',
			isActive: location.pathname.startsWith('/admin/organizations'),
			icon: BuildingIcon,
		},
		{
			title: 'Cache',
			url: '/admin/cache',
			isActive: location.pathname.startsWith('/admin/cache'),
			icon: SettingsGearIcon,
		},
		{
			title: 'Audit Logs',
			url: '/admin/audit-logs',
			isActive: location.pathname.startsWith('/admin/audit-logs'),
			icon: IconShield,
		},
	]

	// User data for NavUser component
	const userData = rootData?.user
		? {
			name: rootData.user.name || rootData.user.username || 'Admin',
			email: rootData.user.username,
			avatar: rootData.user.image
				? `/resources/images?objectKey=${rootData.user.image.objectKey}`
				: '/avatars/user.jpg',
			roles: rootData.user.roles,
		}
		: {
			name: 'Admin',
			email: '',
			avatar: '/avatars/user.jpg',
			roles: [],
		}

	return (
		<Sidebar collapsible="offcanvas" {...props}>
			<SidebarHeader className="space-y-4 p-2">
				<Logo className="pl-6 mb-0" />
				<div className="px-6">
					<div className="text-sm font-medium text-sidebar-foreground">
						Admin Dashboard
					</div>
					<div className="text-xs text-sidebar-muted-foreground">
						System Management
					</div>
				</div>
			</SidebarHeader>

			<SidebarContent>
				<NavMain items={navMain} />
			</SidebarContent>

			<SidebarFooter>
				<NavUser user={userData} />
			</SidebarFooter>
		</Sidebar>
	)
}