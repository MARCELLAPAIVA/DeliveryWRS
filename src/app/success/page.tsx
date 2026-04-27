'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { buildWhatsAppUrl } from '@/lib/utils'
import { CheckCircle, MessageCircle } from 'lucide-react'
import { Suspense } from 'react'

function SuccessContent() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get('orderId') ?? ''
  const summary = searchParams.get('summary') ?? ''
  const [whatsapp, setWhatsapp] = useState('5521985529198')

  useEffect(() => {
    supabase.from('settings').select('whatsapp').limit(1).single().then(({ data }) => {
      if (data?.whatsapp) setWhatsapp(data.whatsapp)
    })
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md text-center">
        <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Pedido realizado com sucesso!</h1>
        <p className="text-gray-500 mb-2">Pedido #{orderId.slice(0, 8)}</p>
        <p className="text-gray-600 mb-8">
          Agora envie a confirmacao do seu pedido para nosso WhatsApp para agilizar o atendimento.
        </p>

        <a
          href={buildWhatsAppUrl(whatsapp, summary)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-green-500 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-green-600 transition-colors"
        >
          <MessageCircle className="w-6 h-6" />
          Enviar pelo WhatsApp
        </a>

        <Link href="/" className="block mt-6 text-orange-500 font-medium hover:underline">
          Voltar para a loja
        </Link>
      </div>
    </div>
  )
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <SuccessContent />
    </Suspense>
  )
}
