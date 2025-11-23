"use client"

import SubmitReceipt from '@/components/staff/request-view/single/submit-receipt/SubmitReceipt'
import { useParams } from 'next/navigation'

function SubmitReceiptPage() {
  const params = useParams()
  const id = typeof params?.id === 'string' || typeof params?.id === 'number' ? params.id : ''

  return (
    <SubmitReceipt requestId={id} />
  )
}

export default SubmitReceiptPage