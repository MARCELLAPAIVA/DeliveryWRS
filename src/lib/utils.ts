export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

export function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateStr))
}

export function formatDateShort(dateStr: string): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(dateStr))
}

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}

export function statusLabel(status: string): string {
  return ORDER_STATUS_LABELS[status] ?? status
}

export function statusColor(status: string): string {
  return ORDER_STATUS_COLORS[status] ?? 'bg-gray-100 text-gray-800'
}

export const ORDER_STATUS_LABELS: Record<string, string> = {
  new: 'Novo',
  preparing: 'Em Preparo',
  delivering: 'Saiu para Entrega',
  done: 'Finalizado',
  cancelled: 'Cancelado',
}

export const ORDER_STATUS_COLORS: Record<string, string> = {
  new: 'bg-blue-100 text-blue-800',
  preparing: 'bg-yellow-100 text-yellow-800',
  delivering: 'bg-orange-100 text-orange-800',
  done: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
}

export const PAYMENT_LABELS: Record<string, string> = {
  cash: 'Dinheiro',
  card: 'Cartao',
  pix: 'PIX',
  money: 'Dinheiro',
}

export function paymentLabel(method: string): string {
  return PAYMENT_LABELS[method] ?? method
}

export function buildWhatsAppUrl(whatsapp: string, orderSummary: string): string {
  const encoded = encodeURIComponent(orderSummary)
  return `https://wa.me/${whatsapp}?text=${encoded}`
}

export function buildWhatsAppMessage(order: {
  id: string
  items: { name: string; quantity: number; price: number }[]
  subtotal: number
  deliveryFee: number
  total: number
  payment: string
  changeFor?: number | null
  address: string
  neighborhood: string
  notes?: string | null
}): string {
  let msg = `*Pedido #${order.id.slice(0, 8).toUpperCase()}*\n\n`
  msg += `*Itens:*\n`
  order.items.forEach(item => {
    msg += `• ${item.quantity}x ${item.name} - ${formatCurrency(item.price * item.quantity)}\n`
  })
  msg += `\n*Subtotal:* ${formatCurrency(order.subtotal)}\n`
  msg += `*Taxa de entrega:* ${formatCurrency(order.deliveryFee)}\n`
  msg += `*Total:* ${formatCurrency(order.total)}\n\n`
  msg += `*Pagamento:* ${PAYMENT_LABELS[order.payment] ?? order.payment}\n`
  if (order.changeFor) msg += `*Troco para:* ${formatCurrency(order.changeFor)}\n`
  msg += `*Endereco:* ${order.address}, ${order.neighborhood}\n`
  if (order.notes) msg += `*Obs:* ${order.notes}\n`
  return msg
}
