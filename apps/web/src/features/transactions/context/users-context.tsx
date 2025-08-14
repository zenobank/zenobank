import React, { useState } from 'react'
import useDialogState from '@/hooks/use-dialog-state'
import { User } from '../data/schema'

type TransactionsDialogType = 'invite' | 'add' | 'edit' | 'delete'

interface TransactionsContextType {
  open: TransactionsDialogType | null
  setOpen: (str: TransactionsDialogType | null) => void
  currentRow: User | null
  setCurrentRow: React.Dispatch<React.SetStateAction<User | null>>
}

const TransactionsContext = React.createContext<TransactionsContextType | null>(
  null
)

interface Props {
  children: React.ReactNode
}

export default function TransactionsProvider({ children }: Props) {
  const [open, setOpen] = useDialogState<TransactionsDialogType>(null)
  const [currentRow, setCurrentRow] = useState<User | null>(null)

  return (
    <TransactionsContext value={{ open, setOpen, currentRow, setCurrentRow }}>
      {children}
    </TransactionsContext>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useTransactions = () => {
  const usersContext = React.useContext(TransactionsContext)

  if (!usersContext) {
    throw new Error('useUsers has to be used within <UsersContext>')
  }

  return usersContext
}
