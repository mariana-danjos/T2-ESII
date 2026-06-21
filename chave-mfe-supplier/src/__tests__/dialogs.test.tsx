import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LinkProductDialog from '../components/LinkProductDialog';
import ReplenishmentDialog from '../components/ReplenishmentDialog';

describe('LinkProductDialog', () => {
  it('submits a typed payload', async () => {
    const onSubmit = jest.fn();
    render(<LinkProductDialog open onClose={() => {}} onSubmit={onSubmit} />);
    await userEvent.type(screen.getByLabelText(/ID do produto/i), 'prod-1');
    await userEvent.type(screen.getByLabelText(/Preço de fornecimento/i), '49.9');
    await userEvent.type(screen.getByLabelText(/Lead time/i), '7');
    await userEvent.click(screen.getByRole('button', { name: /vincular/i }));
    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({
      productId: 'prod-1', supplyPrice: 49.9, leadTimeDays: 7, supplierSku: null,
    }));
  });

  it('does not submit without productId', async () => {
    const onSubmit = jest.fn();
    render(<LinkProductDialog open onClose={() => {}} onSubmit={onSubmit} />);
    expect(screen.getByRole('button', { name: /vincular/i })).toBeDisabled();
    expect(onSubmit).not.toHaveBeenCalled();
  });
});

describe('ReplenishmentDialog', () => {
  it('adds/removes item rows and submits', async () => {
    const onSubmit = jest.fn();
    render(<ReplenishmentDialog open onClose={() => {}} onSubmit={onSubmit} />);
    await userEvent.type(screen.getAllByLabelText(/ID do produto/i)[0], 'p1');
    await userEvent.click(screen.getByRole('button', { name: /adicionar item/i }));
    expect(screen.getAllByLabelText(/ID do produto/i)).toHaveLength(2);
    await userEvent.click(screen.getAllByLabelText(/remover item/i)[1]);
    expect(screen.getAllByLabelText(/ID do produto/i)).toHaveLength(1);
    await userEvent.click(screen.getByRole('button', { name: /registrar/i }));
    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({
      status: 'requested',
      items: [expect.objectContaining({ productId: 'p1', quantity: 1, unitCost: null })],
    }));
  });
});
