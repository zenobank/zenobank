import { Clock } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export default function TimerBadge() {
  return (
    <Badge
      variant='outline'
      className='flex h-8 w-24 items-center justify-center gap-1.5 rounded-lg'
    >
      <Clock className='h-6 w-6' />
      <span className='text-xs'>60:00</span>
    </Badge>
  )
}
