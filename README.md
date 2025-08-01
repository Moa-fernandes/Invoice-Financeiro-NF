# Financeiro - NF


O **Recrinanceiro** é um sistema completo para **gestão financeira de clínicas e consultórios**, com controle de **notas fiscais emitidas, recebimentos, glosas, tributações, despesas e dívidas/obrigações**. A solução prioriza automação, integrações, facilidade de uso e transparência financeira.

### Funcionalidades

- **Cadastro de Notas Emitidas:** registre NFs, datas, valores, paciente, serviço.
- **Recebimentos:** relacione entradas (pagamentos) às NFs, com controle de valor, forma de pagamento e datas.
- **Glosas:** registre descontos (glosas) aplicados nas notas, com histórico por NF.
- **Tributações:** aplique e calcule tributos automaticamente por percentual, com impacto no valor pendente das notas.
- **Despesas:** controle despesas administrativas, recorrentes ou avulsas.
- **Dívidas/Obrigações:** registre e acompanhe dívidas e obrigações financeiras, inclusive status de pagamento.
- **Painéis e Tabelas:** relatórios de todas as entidades, filtros por situação, cálculo automático de valores pendentes, recebidos, glosados e tributados.
- **Dashboard:** visão geral do financeiro.
- **Totalmente integrado ao MongoDB.**
- **Frontend responsivo** (React + Typescript), fácil de usar.
- **API documentada** com FastAPI (Swagger/OpenAPI).

### Tecnologias Utilizadas

- **Frontend:** React, Typescript, CSS3 (ou Tailwind opcional)
- **Backend:** FastAPI (Python 3.12+)
- **Banco de Dados:** MongoDB (via Motor)
- **ORM/Validação:** Pydantic
- **APIs:** RESTful, CORS liberado para desenvolvimento local
- **Outros:** XLSX/Excel export, FileSaver, React Icons

### Como Rodar

#### Pré-requisitos

- [Python 3.12+](https://www.python.org/downloads/)
- [Node.js (18+)](https://nodejs.org/en)
- [MongoDB Community](https://www.mongodb.com/try/download/community) rodando localmente (default: `mongodb://localhost:27017`)

#### Instalação Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
source venv/bin/activate    # Linux/Mac
pip install -r requirements.txt
uvicorn app.main:app --reload

Instalação Frontend

cd frontend
npm install
npm run dev

 #### English Version

is a full financial management system for clinics and small businesses, handling issued invoices, receipts, discounts (glosas), taxes, expenses, and debts/obligations. Designed for automation, integration, and an intuitive experience.


Features
Issued Invoices: Register invoices with dates, amounts, patient, and services.

Receipts: Link payments to invoices, tracking amount, payment method, and date.

Glosas (Discounts): Record discounts applied to invoices, with full history per invoice.

Taxations: Apply and auto-calculate taxes by percentage, affecting invoice pending value.

Expenses: Register and manage administrative or recurring expenses.

Debts/Obligations: Track financial obligations, including payment status.

Dashboards & Tables: Report on all entities, automatic calculations (received, pending, discounted, taxed).

Dashboard: Global financial overview.

Full MongoDB integration.

Responsive frontend (React + Typescript), user friendly.

Documented API via FastAPI (Swagger/OpenAPI).

Tech Stack
Frontend: React, Typescript, CSS3 (or Tailwind optional)

Backend: FastAPI (Python 3.12+)

Database: MongoDB (Motor async driver)

Validation: Pydantic

APIs: RESTful, CORS enabled for local dev

Extras: XLSX/Excel export, FileSaver, React Icons

How to Run
Prerequisites
Python 3.12+

Node.js (18+)

MongoDB Community running locally (default: mongodb://localhost:27017)

Backend Setup

cd backend
python -m venv venv
venv\Scripts\activate        # Windows
source venv/bin/activate    # Linux/Mac
pip install -r requirements.txt
uvicorn app.main:app --reload


Frontend Setup

cd frontend
npm install
npm run dev



Enjoy-it!!
