'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { formatCurrency, formatDate } from '@/lib/utils';
import { ShoppingBag, CheckCircle2, Clock, AlertTriangle, ExternalLink, RefreshCw } from 'lucide-react';

interface OrderManagerClientProps {
  initialOrders: any[];
}

export default function OrderManagerClient({ initialOrders }: OrderManagerClientProps) {
  const router = useRouter();
  const [orders, setOrders] = useState(initialOrders);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isUpdating, setIsUpdating] = useState(false);

  const filteredOrders = orders.filter((o) => {
    if (filterStatus === 'all') return true;
    return o.payment_status === filterStatus || o.fulfillment_status === filterStatus;
  });

  const handleUpdateStatus = async (orderId: string, updates: Record<string, string>) => {
    setIsUpdating(true);
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, ...updates })
      });

      if (res.ok) {
        // Update local state
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, ...updates } : o))
        );
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder((prev: any) => ({ ...prev, ...updates }));
        }
        router.refresh();
      } else {
        alert('Failed to update order status');
      }
    } catch {
      alert('Error updating order');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div>
      {/* Filters Bar */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {['all', 'completed', 'pending', 'failed', 'delivered'].map((st) => (
          <button
            key={st}
            type="button"
            className={`btn btn-sm ${filterStatus === st ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilterStatus(st)}
            style={{ textTransform: 'capitalize' }}
          >
            {st}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: selectedOrder ? '1fr 1fr' : '1fr', gap: '2rem' }}>
        {/* Orders Table */}
        <div className="card" style={{ padding: '1.5rem' }}>
          {filteredOrders.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>
              No orders matching this filter.
            </p>
          ) : (
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Order #</th>
                    <th>Customer</th>
                    <th>Service</th>
                    <th>Amount</th>
                    <th>Payment</th>
                    <th>Fulfillment</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((o) => (
                    <tr key={o.id}>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>{o.order_number}</td>
                      <td>
                        <strong style={{ display: 'block', fontSize: '0.9rem' }}>{o.customer_name}</strong>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{o.customer_email}</span>
                      </td>
                      <td style={{ fontSize: '0.85rem' }}>{o.service_name}</td>
                      <td style={{ fontWeight: 600 }}>{formatCurrency(o.amount_cents, o.currency)}</td>
                      <td>
                        <span className={`badge ${o.payment_status === 'completed' ? 'badge-success' : o.payment_status === 'pending' ? 'badge-warning' : 'badge-danger'}`} style={{ textTransform: 'uppercase' }}>
                          {o.payment_status}
                        </span>
                      </td>
                      <td>
                        <span className="badge" style={{ textTransform: 'capitalize' }}>
                          {o.fulfillment_status.replace('_', ' ')}
                        </span>
                      </td>
                      <td>
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => setSelectedOrder(o)}
                        >
                          Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Selected Order Detail Sidebar */}
        {selectedOrder && (
          <div className="card" style={{ padding: '2rem', background: 'var(--bg-surface-elevated)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <span className="badge badge-brand">{selectedOrder.order_number}</span>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => setSelectedOrder(null)}
              >
                Close
              </button>
            </div>

            <h2 style={{ fontSize: '1.35rem', marginBottom: '0.5rem' }}>{selectedOrder.service_name}</h2>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--accent-cyan)', marginBottom: '1.5rem' }}>
              {formatCurrency(selectedOrder.amount_cents, selectedOrder.currency)}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1.25rem' }}>
              <div><strong>Customer:</strong> {selectedOrder.customer_name}</div>
              <div><strong>Email:</strong> <a href={`mailto:${selectedOrder.customer_email}`} style={{ color: 'var(--accent-cyan)' }}>{selectedOrder.customer_email}</a></div>
              <div><strong>Gateway Provider:</strong> <code>{selectedOrder.payment_provider}</code></div>
              <div><strong>Payment Reference:</strong> <code>{selectedOrder.payment_reference || 'None'}</code></div>
              <div><strong>Order Date:</strong> {formatDate(selectedOrder.created_at)}</div>
            </div>

            {selectedOrder.requirements_submitted && (
              <div style={{ marginBottom: '1.5rem' }}>
                <strong style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>
                  Submitted Customer Requirements:
                </strong>
                <p style={{ background: 'var(--bg-surface)', padding: '0.85rem', borderRadius: 'var(--radius-md)', fontSize: '0.875rem', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)' }}>
                  {selectedOrder.requirements_submitted}
                </p>
              </div>
            )}

            {/* Quick Status Modifiers */}
            <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1.25rem' }}>
              <strong style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '0.75rem' }}>
                Update Order States
              </strong>

              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                <button
                  type="button"
                  className="btn btn-sm btn-secondary"
                  onClick={() => handleUpdateStatus(selectedOrder.id, { paymentStatus: 'completed' })}
                  disabled={isUpdating}
                >
                  Mark Payment Completed
                </button>
                <button
                  type="button"
                  className="btn btn-sm btn-secondary"
                  onClick={() => handleUpdateStatus(selectedOrder.id, { fulfillmentStatus: 'in_progress' })}
                  disabled={isUpdating}
                >
                  Mark In Progress
                </button>
                <button
                  type="button"
                  className="btn btn-sm btn-primary"
                  onClick={() => handleUpdateStatus(selectedOrder.id, { fulfillmentStatus: 'delivered' })}
                  disabled={isUpdating}
                >
                  Mark Delivered
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
