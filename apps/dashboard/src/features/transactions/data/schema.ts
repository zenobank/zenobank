import { z } from 'zod'

const userStatusSchema = z.union([
  z.literal('active'),
  z.literal('inactive'),
  z.literal('invited'),
  z.literal('suspended'),
])
export type UserStatus = z.infer<typeof userStatusSchema>

const userRoleSchema = z.union([
  z.literal('superadmin'),
  z.literal('admin'),
  z.literal('cashier'),
  z.literal('manager'),
])

const userSchema = z.object({
  id: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  username: z.string(),
  email: z.string(),
  phoneNumber: z.string(),
  status: userStatusSchema,
  role: userRoleSchema,
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})
export type User = z.infer<typeof userSchema>

export const userListSchema = z.array(userSchema)

// Payment Schema
const paymentStatusSchema = z.union([
  z.literal('PENDING'),
  z.literal('UNDER_PAYMENT'),
  z.literal('COMPLETED'),
  z.literal('EXPIRED'),
  z.literal('CANCELLED'),
  z.literal('PROCESSING'),
])
export type PaymentStatus = z.infer<typeof paymentStatusSchema>

const paymentSchema = z.object({
  id: z.string(),
  priceAmount: z.string(),
  priceCurrency: z.string(),
  status: paymentStatusSchema,
  createdAt: z.string(),
  expiredAt: z.string(),
  depositDetails: z.any().nullable(),
  paymentUrl: z.string(),
  webhookUrl: z.string().nullable(),
  successUrl: z.string().nullable(),
  transactionHash: z.string().nullable(),
  confirmationAttempts: z.number(),
})
export type Payment = z.infer<typeof paymentSchema>

export const paymentListSchema = z.array(paymentSchema)
