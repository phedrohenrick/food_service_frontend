// Labels PT-BR para os status canônicos do pedido. Mantenha sincronizado com
// OrderStatusType no backend e com orderFlow em OrderDetails.jsx.
export const ORDER_STATUS_LABELS = {
  CREATED: 'Criado',
  PAYMENT_AUTHORIZED: 'Pagamento aprovado',
  ACCEPTED: 'Confirmado',
  IN_PREPARATION: 'Preparando',
  READY: 'Separado',
  WAITING_FOR_COLLECTION: 'Aguardando coleta',
  ON_ROUTE: 'A caminho',
  DELIVERED: 'Entregue',
  COMPLETED: 'Concluído',
  CANCELED: 'Cancelado',
};

export function formatOrderStatus(status, fallback = '—') {
  if (!status) return fallback;
  return ORDER_STATUS_LABELS[String(status).toUpperCase()] || fallback;
}
