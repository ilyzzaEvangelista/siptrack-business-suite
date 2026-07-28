import { Printer } from 'lucide-react'
import { Button } from '@/components/ui'

export function PrintButton({ label = 'Print' }) {
  return (
    <Button
      type="button"
      variant="secondary"
      className="no-print"
      onClick={() => window.print()}
    >
      <Printer className="h-4 w-4" />
      {label}
    </Button>
  )
}
