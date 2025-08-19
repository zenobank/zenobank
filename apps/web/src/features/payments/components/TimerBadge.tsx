import { useState, useEffect } from 'react'
import { Clock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

interface TimerBadgeProps {
  expiredAt: string
  onExpired?: () => void
}

export default function TimerBadge({ expiredAt, onExpired }: TimerBadgeProps) {
  const [timeLeft, setTimeLeft] = useState<string>('')
  const [isExpired, setIsExpired] = useState(false)

  useEffect(() => {
    // Don't start timer if no expiration date
    if (!expiredAt) {
      setTimeLeft('--:--')
      return
    }

    const calculateTimeLeft = () => {
      const now = new Date().getTime()
      const expirationTime = new Date(expiredAt).getTime()

      // Check if the date is valid
      if (isNaN(expirationTime)) {
        setTimeLeft('--:--')
        return
      }

      const difference = expirationTime - now

      if (difference <= 0) {
        setIsExpired(true)
        setTimeLeft('00:00')
        onExpired?.()
        return
      }

      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((difference % (1000 * 60)) / 1000)

      setTimeLeft(
        `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      )
    }

    // Calculate immediately
    calculateTimeLeft()

    // Update every second
    const timer = setInterval(calculateTimeLeft, 1000)

    return () => clearInterval(timer)
  }, [expiredAt, onExpired])

  const isWarning =
    !isExpired &&
    timeLeft !== '' &&
    timeLeft !== '--:--' &&
    parseInt(timeLeft.split(':')[0]) < 5

  // Don't render if no expiration date
  if (!expiredAt) {
    return null
  }

  return (
    <Badge
      variant='outline'
      className={cn(
        'flex h-8 w-24 items-center justify-center gap-1.5 rounded-lg transition-colors',
        isExpired &&
          'border-red-300 bg-red-100 text-red-700 dark:border-red-700 dark:bg-red-900/20 dark:text-red-400',
        isWarning &&
          'border-orange-300 bg-orange-100 text-orange-700 dark:border-orange-700 dark:bg-orange-900/20 dark:text-orange-400'
      )}
    >
      <Clock
        className={cn(
          'h-6 w-6',
          isExpired && 'text-red-600 dark:text-red-400',
          isWarning && 'text-orange-600 dark:text-orange-400'
        )}
      />
      <span className='font-mono text-xs'>{timeLeft}</span>
    </Badge>
  )
}
