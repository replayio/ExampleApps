# Acctual Clone

An **Acctual.app clone** — invoicing and payments software for freelancers and small businesses. Built with **Vite + React 19 + shadcn/ui** and a **Netlify Functions** in-memory API.

Based on the Acctual web UI reference (Nov 2025).

## Stack

- Vite + React 19, TypeScript, Tailwind v4, shadcn/ui
- **Zustand** — navigation and modal state
- **TanStack Query** — server state
- **Netlify Functions** — REST API for invoices, bills, contacts, payments

## Features

- Light Acctual-inspired UI (gray sidebar, white content cards)
- **Invoices** — tabbed list (Draft, Unpaid, Overdue, Paid), create-invoice wizard with live preview, view/send/update
- **Payments** — Receive/Transfer tabs, setup cards, transaction history
- **Bills** — tabbed AP workflow (Draft → Approve → Ready → Paid)
- **Contacts** — contact list with add-contact drawer
- Crypto + fiat payment methods (USDT, USD ACH, etc.)

## Run it

```bash
cd acctual
npm install
npm start          # = netlify dev  → http://localhost:8888
```

Front end only: `npm run dev`.

## Layout

```
netlify/functions/api.mts           # REST API
netlify/functions/lib/data.ts       # seed data
src/components/invoices-view.tsx    # invoice list + tabs
src/components/create-invoice-dialog.tsx
src/components/view-invoice-dialog.tsx
src/components/invoice-preview.tsx  # live document preview
src/components/payments-view.tsx
src/components/bills-view.tsx
src/components/contacts-view.tsx
```
