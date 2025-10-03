import {
  IconCash,
  IconShield,
  IconUsersGroup,
  IconUserShield,
} from '@tabler/icons-react'
import { UserStatus, PaymentStatus } from './schema'

export const callTypes = new Map<UserStatus, string>([
  ['active', 'bg-teal-100/30 text-teal-900 dark:text-teal-200 border-teal-200'],
  ['inactive', 'bg-neutral-300/40 border-neutral-300'],
  ['invited', 'bg-sky-200/40 text-sky-900 dark:text-sky-100 border-sky-300'],
  [
    'suspended',
    'bg-destructive/10 dark:bg-destructive/50 text-destructive dark:text-primary border-destructive/10',
  ],
])

export const paymentStatusColors = new Map<PaymentStatus, string>([
  [
    'PENDING',
    'bg-yellow-100/30 text-yellow-900 dark:text-yellow-200 border-yellow-200',
  ],
  [
    'UNDER_PAYMENT',
    'bg-blue-100/30 text-blue-900 dark:text-blue-200 border-blue-200',
  ],
  [
    'COMPLETED',
    'bg-teal-100/30 text-teal-900 dark:text-teal-200 border-teal-200',
  ],
  [
    'PROCESSING',
    'bg-purple-100/30 text-purple-900 dark:text-purple-200 border-purple-200',
  ],
  ['EXPIRED', 'bg-neutral-300/40 border-neutral-300'],
  [
    'CANCELLED',
    'bg-destructive/10 dark:bg-destructive/50 text-destructive dark:text-primary border-destructive/10',
  ],
])

export const userTypes = [
  {
    label: 'Superadmin',
    value: 'superadmin',
    icon: IconShield,
  },
  {
    label: 'Admin',
    value: 'admin',
    icon: IconUserShield,
  },
  {
    label: 'Manager',
    value: 'manager',
    icon: IconUsersGroup,
  },
  {
    label: 'Cashier',
    value: 'cashier',
    icon: IconCash,
  },
] as const
