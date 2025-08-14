import {
  IconChecklist,
  IconHelp,
  IconNotification,
  IconLayoutDashboard,
  IconPackages,
  IconPalette,
  IconSettings,
  IconTool,
  IconUserCog,
  IconUsers,
  IconBrandGoogleAnalytics,
  IconKey,
  IconPlug,
} from '@tabler/icons-react'
import { useOrganizationList, useUser } from '@clerk/clerk-react'
import { Command } from 'cmdk'
import { GalleryVerticalEnd, AudioWaveform } from 'lucide-react'
import { ClerkLogo } from '@/assets/clerk-logo'
import { SidebarData } from './types'

export function useSidebarData(): SidebarData {
  const { user } = useUser()
  const { userMemberships } = useOrganizationList({
    userMemberships: true,
  })

  return {
    teams: [
      {
        name: 'Personal',
        logo: ClerkLogo,
        plan: 'Personal',
      },
      ...(userMemberships?.data?.map((org) => ({
        name: org.organization.name,
        logo: Command,
        plan: 'Personal',
      })) ?? []),
    ],

    navGroups: [
      {
        title: 'General',
        items: [
          {
            title: 'Dashboard',
            url: '/',
            icon: IconLayoutDashboard,
          },
          {
            title: 'Tasks',
            url: '/tasks',
            icon: IconChecklist,
          },
          {
            title: 'Apps',
            url: '/apps',

            icon: IconPackages,
          },

          {
            title: 'Transactions',
            url: '/transactions',
            icon: IconUsers,
          },
        ],
      },

      {
        title: 'Other',
        items: [
          {
            title: 'Settings',
            icon: IconSettings,
            items: [
              {
                title: 'Profile',
                url: '/settings',
                icon: IconUserCog,
              },
              {
                title: 'Account',
                url: '/settings/account',
                icon: IconTool,
              },
              {
                title: 'Appearance',
                url: '/settings/appearance',
                icon: IconPalette,
              },
              {
                title: 'Notifications',
                url: '/settings/notifications',
                icon: IconNotification,
              },
            ],
          },
          {
            title: 'Help Center',
            url: '/help-center',
            icon: IconHelp,
          },
        ],
      },
      {
        title: 'Integrations',
        items: [
          {
            title: 'API keys',
            url: '/transactions',
            icon: IconKey,
          },
          {
            title: 'Plugins',
            url: '/apps',
            icon: IconPlug,
          },
        ],
      },
    ],
  }
}
