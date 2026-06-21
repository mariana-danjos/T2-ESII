import {
  CreateReplenishmentPayload, CreateSupplierPayload, LinkProductPayload, Paginated,
  ReplenishmentOrder, Supplier, SupplierProduct,
} from './types';

export interface ListParams {
  page: number; pageSize: number;
  status?: string; city?: string; state?: string; productId?: string; q?: string;
}

export class SupplierApi {
  constructor(private baseUrl: string) {}

  private async request<T>(path: string, init?: RequestInit): Promise<T> {
    const token = localStorage.getItem('token');
    const res = await fetch(`${this.baseUrl}${path}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(init?.headers ?? {}),
      },
    });
    if (res.status === 204) return undefined as T;
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      const message = (body as { error?: string }).error ?? `Erro ${res.status}`;
      throw new Error(message);
    }
    return body as T;
  }

  listSuppliers(params: ListParams): Promise<Paginated<Supplier>> {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => { if (v !== undefined && v !== '') qs.append(k, String(v)); });
    return this.request<Paginated<Supplier>>(`/suppliers?${qs.toString()}`);
  }
  getSupplier(id: string): Promise<Supplier> { return this.request(`/suppliers/${id}`); }
  createSupplier(payload: CreateSupplierPayload): Promise<Supplier> {
    return this.request('/suppliers', { method: 'POST', body: JSON.stringify(payload) });
  }
  updateSupplier(id: string, payload: Partial<CreateSupplierPayload> & { status?: string }): Promise<Supplier> {
    return this.request(`/suppliers/${id}`, { method: 'PATCH', body: JSON.stringify(payload) });
  }
  inactivateSupplier(id: string): Promise<Supplier> {
    return this.request(`/suppliers/${id}`, { method: 'DELETE' });
  }
  listProducts(id: string): Promise<SupplierProduct[]> { return this.request(`/suppliers/${id}/products`); }
  linkProduct(id: string, payload: LinkProductPayload): Promise<SupplierProduct> {
    return this.request(`/suppliers/${id}/products`, { method: 'POST', body: JSON.stringify(payload) });
  }
  unlinkProduct(id: string, productId: string): Promise<void> {
    return this.request(`/suppliers/${id}/products/${productId}`, { method: 'DELETE' });
  }
  listReplenishments(id: string, params?: { status?: string; from?: string; to?: string }): Promise<ReplenishmentOrder[]> {
    const qs = new URLSearchParams();
    if (params) Object.entries(params).forEach(([k, v]) => { if (v) qs.append(k, v); });
    return this.request(`/suppliers/${id}/replenishments?${qs.toString()}`);
  }
  createReplenishment(id: string, payload: CreateReplenishmentPayload): Promise<ReplenishmentOrder> {
    return this.request(`/suppliers/${id}/replenishments`, { method: 'POST', body: JSON.stringify(payload) });
  }
}
