# chave-mfe-supplier

Microfrontend de **Gestão de Fornecedores** do sistema Chave (loja plus size) —
Engenharia de Software II, PUCRS 2026-1, Turma 30, Grupo It Girls. Consome o
microsserviço `chave-ms-supplier` e é montado no Shell via Module Federation.

## Stack

- **React 18 + TypeScript + Vite 5**
- **MUI v9** (`@mui/material`, `@mui/icons-material`, `@emotion`) + **`@mui/x-data-grid` v9** (lista paginada)
- **`@originjs/vite-plugin-federation`** — remote `mfe_supplier`
- **Jest + Testing Library** (jsdom)

## Como rodar (standalone)

```bash
npm install
cp .env.example .env          # VITE_MS_SUPPLIER_URL aponta para o MS (default http://localhost:3002)
npm run dev                   # http://localhost:4002
```

O token de autenticação é lido de `localStorage` (chave `token`) e enviado no header
`Authorization: Bearer <token>` — faça login pelo MFE de Auth / Shell para populá-lo.

Outros comandos:

```bash
npm test               # testes (Jest + Testing Library)
npm run test:coverage  # com cobertura (thresholds 50% em jest.config.cjs)
npm run lint           # tsc --noEmit (strict)
npm run build          # vite build → dist/assets/remoteEntry.js
```

## Integração via Module Federation

O `vite.config.ts` expõe o remote `mfe_supplier` (`filename: remoteEntry.js`) com os módulos:

| Exposto | Componente |
|---|---|
| `./SupplierApp` | App completo (mount único do shell, com roteamento interno por view-state) |
| `./SupplierListPage` | Lista de fornecedores |
| `./SupplierFormPage` | Formulário criar/editar |
| `./SupplierDetailPage` | Detalhe com abas |

O Shell consome via `lazy(() => import("mfe_supplier/SupplierApp"))` na rota `/suppliers`.
`react` e `react-dom` são compartilhados (`shared`). A URL do remote é
`http://localhost:4002/assets/remoteEntry.js` (sobrescrevível por `MFE_SUPPLIER_URL` no shell).

---

## Manual de UI

### 1. Lista de fornecedores (tela inicial)

- **DataGrid paginado** (`@mui/x-data-grid`) com paginação **server-side**: as páginas são
  buscadas no MS conforme você navega (`page`, `pageSize`).
- **Filtros** no topo: campo **Buscar** (razão social / nome fantasia / documento),
  **Status** (Todos / Ativo / Inativo), **Cidade** e **Estado**. Clique em **Buscar** para
  aplicar — a lista volta à primeira página e re-consulta o MS.
- **Colunas**: Razão Social, Nome Fantasia, Documento, Status (chip colorido), Cidade e
  **Ações** por linha:
  - **Abrir** → tela de detalhe;
  - **Editar** → formulário em modo edição;
  - **Inativar** → soft delete (desabilitado se já inativo); a lista recarrega.
- Botão **Novo fornecedor** (canto superior direito) → formulário em modo criação.
- **Estados**: spinner de carregamento no grid; **Alert** vermelho em caso de erro.

### 2. Formulário (criar / editar)

- Campos do fornecedor (Razão Social, Nome Fantasia, **Documento CNPJ/CPF**, E-mail,
  Telefone, Pessoa de contato) e bloco de **Endereço** (logradouro, número, complemento,
  bairro, cidade, estado, CEP, país).
- **Validação client-side**: Razão Social e Documento obrigatórios, e-mail válido —
  mensagens de erro aparecem como `helperText` abaixo do campo e o envio é bloqueado.
- Em **modo edição** os dados são carregados do MS e o **Documento fica bloqueado**
  (imutável). O envio bruto vai ao MS, que normaliza/valida o documento.
- Botões **Salvar** (mostra "Salvando..." durante o request) e **Cancelar** (volta à lista).
- **Alert** de erro no topo se o MS rejeitar (ex.: `409` documento duplicado).

### 3. Detalhe do fornecedor

Carrega fornecedor, produtos e reposições em paralelo. Cabeçalho com razão social, chip de
status e botões **Voltar** / **Editar**. Três **abas**:

- **Dados** — nome fantasia, documento + tipo, e-mail, telefone, contato, cidade/UF.
- **Produtos vinculados** — tabela (produto, preço, lead time, SKU) + botão
  **Vincular produto** que abre o **diálogo de vínculo** (ID do produto obrigatório, preço,
  lead time e SKU opcionais). Cada linha tem **Desvincular**. A tabela recarrega após cada ação.
- **Reposições** — tabela (pedido, status, total, nº de itens, data) + botão
  **Registrar reposição** que abre o **diálogo de reposição**: seleção de **Status** e uma
  **lista dinâmica de itens** (ID do produto, quantidade, custo unitário) com **Adicionar
  item** / remover linha. O MS calcula o total quando todos os itens têm custo.

Todas as telas tratam **loading** (spinner) e **erros** (Alert).
