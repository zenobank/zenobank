'use client'

import { IconDownload } from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TiendaNubeIntegrationDialog({ open, onOpenChange }: Props) {
  const installApp = () => {
    // No action needed
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-lg'>
        <DialogHeader>
          <DialogTitle>Tienda Nube Integration</DialogTitle>
          <DialogDescription>
            Install the ZenoBank app in your Tienda Nube store
          </DialogDescription>
        </DialogHeader>

        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='flex items-center gap-2 text-base'>
              <IconDownload className='h-5 w-5' />
              Install Tienda Nube App
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className='text-muted-foreground mb-3 text-sm'>
              Install the ZenoBank app in your Tienda Nube store
            </p>
            <Button onClick={installApp} size='sm'>
              Install App
            </Button>
          </CardContent>
        </Card>

        {/* <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Done</Button>
        </DialogFooter> */}
      </DialogContent>
    </Dialog>
  )
}
