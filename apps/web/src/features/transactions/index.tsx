import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { columns } from './components/users-columns'
import { UsersDialogs } from './components/users-dialogs'
import { TransactionsPrimaryButtons } from './components/users-primary-buttons'
import { UsersTable } from './components/users-table'
import TransactionsProvider from './context/users-context'
import { userListSchema } from './data/schema'
import { users } from './data/users'

export default function Transactions() {
  // Parse user list
  const userList = userListSchema.parse(users)

  return (
    <TransactionsProvider>
      <Header fixed>
        <Search />
        <div className='ml-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        <div className='mb-2 flex flex-wrap items-center justify-between space-y-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>Transactions</h2>
            <p className='text-muted-foreground'>
              View your transactions here.
            </p>
          </div>
          <TransactionsPrimaryButtons />
        </div>
        <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12'>
          <UsersTable data={userList} columns={columns} />
        </div>
      </Main>

      <UsersDialogs />
    </TransactionsProvider>
  )
}
