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
  IconCurrencyDollar,
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
            title: 'Transactions',
            url: '/transactions',
            icon: IconUsers,
          },
          {
            title: 'Supported Tokens',
            url: '/401',
            icon: IconCurrencyDollar,
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
            url: '/plugins',
            icon: IconPlug,
          },
        ],
      },
    ],
  }
}
