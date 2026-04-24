import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { OrderStatus, PaymentMethod } from './types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export function formatDate(date: string): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  new: '🆕 Novo',
  preparing: '👨‍🍳 Em Preparo',
  delivery: '🛵 Saiu para Entrega',
  done: '✅ Finalizado',
  cancelled: '❌ Cancelado',
};

export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  new: 'bg-blue-100 text-blue-700',
  preparing: 'bg-yellow-100 text-yellow-700',
  delivery: 'bg-orange-100 text-orange-700',
  done: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

export const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  cash: '💵 Dinheiro',
  card: '💳 Cartão',
  pix: '⚡ PIX',
};

export function buildWhatsAppMessage(order: {
  id: string;
  items: { name: string; quantity: number; price: number }[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  payment: PaymentMethod;
  changeFor?: number | null;
  address: string;
  neighborhood: string;
  notes?: string | null;
}): string {
  const lines: string[] = [
    `🛒 *NOVO PEDIDO #${order.id.slice(0, 8).toUpperCase()}*`,
    '',
    '*Itens:*',
    ...order.items.map(
      (i) => `  • ${i.quantity}x ${i.name} — ${formatCurrency(i.price * i.quantity)}`
    ),
    '',
    `*Subtotal:* ${formatCurrency(order.subtotal)}`,
    `*Entrega:* ${formatCurrency(order.deliveryFee)}`,
    `*Total:* ${formatCurrency(order.total)}`,
    '',
    `*Pagamento:* ${PAYMENT_LABELS[order.payment]}`,
    ...(order.payment === 'cash' && order.changeFor
      ? [`*Troco para:* ${formatCurrency(order.changeFor)}`]
      : []),
    '',
    `*Endereço:* ${order.address}`,
    `*Bairro:* ${order.neighborhood}`,
    ...(order.notes ? [`*Obs:* ${order.notes}`] : []),
  ];

  return encodeURIComponent(lines.join('\n'));
}
