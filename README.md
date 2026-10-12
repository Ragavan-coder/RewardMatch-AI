# RewardMatch AI

> **Swipe Smarter. Save Bigger.**

**RewardMatch AI** is a comprehensive, production-grade personal finance, credit-card rewards optimization, shopping price monitoring, and financial intelligence platform designed for the Indian banking and payment ecosystem.

---

## Key Features

- **Credit Card & RuPay on UPI Optimization**: Intelligent card matching engine computing deterministic cashback rates and points multipliers across major Indian issuers (HDFC, SBI, ICICI, Axis, Tata Neu, etc.).
- **Financial-Grade Python Decimal Precision**: Strict 6-bucket savings ledger maintaining zero floating-point error:
  1. *Confirmed Instant Discount* (Realized)
  2. *Confirmed Cashback* (Realized)
  3. *Confirmed Redeemed Reward* (Realized)
  4. *Pending Reward* (Awaiting statement cycle)
  5. *Estimated Reward* (Pre-clearance)
  6. *Potential Savings* (Shopping recommendations only)
- **Automated Shopping & Price Monitor**: Real-time price tracking across major merchants (Amazon India, Flipkart, Myntra, Ajio, Croma, Reliance Digital) with target price alerts and optimal card recommendations.
- **7-Section Weekly Intelligence Digest**: Scheduled audit reports summarizing spending by category, merchant breakdown, points expiry dates, and next-week optimization opportunities with PDF export.
- **AI Policy & Eligibility RAG Assistant**: Grounded in official bank Schedule of Charges (MITC) and NPCI circulars using sentence transformers and FAISS vector indexing with zero hallucination.
- **Multi-Channel Notification Center**: Real-time in-app alerts and email notifications for price drops and weekly reports.

---

## Technology Stack

### Frontend
- **Framework**: React 18 & TypeScript
- **Styling**: Tailwind CSS & Lucide React
- **Animations**: Framer Motion
- **Tooling**: Vite

### Backend
- **Framework**: Python 3.11, Django 4.2+, Django REST Framework
- **Task Queue**: Celery & Redis
- **Security**: Argon2id password hashing, AES-256-GCM envelope encryption, SSRF protection, IDOR object-level authorization

### Database & Infrastructure
- **Database**: MySQL 8.0
- **Containerization**: Docker & Docker Compose
- **Network Isolation**: 4 segregated Docker networks (`edge`, `application`, `database`, `jobs`)

---

## Quickstart

### Prerequisites
- Node.js (v18+)
- Python 3.11+
- MySQL 8.0+
- (Optional) Docker & Docker Compose

### 1. Environment Setup
Copy the environment template:
```bash
cp .env.example .env
```

### 2. Backend Setup (Django)
```bash
cd django_backend
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver 127.0.0.1:8000
```

### 3. Frontend Setup (React & Vite)
```bash
npm install
npm run dev
```

Visit the application at `http://127.0.0.1:5173`.

---

## Testing & Quality

Run Django tests:
```bash
python django_backend/manage.py test apps.security_audit.tests apps.transactions.tests apps.accounts.tests
```

Run TypeScript compilation check:
```bash
npx tsc --noEmit
```

---

## Security Architecture

- **Envelope Encryption**: AES-256-GCM with HKDF key derivation protects all card and banking metadata at rest.
- **SSRF Defense**: Strict URL validation, DNS re-resolution checks, and private IP blocking for merchant monitoring feeds.
- **Prompt Injection Defense**: Multi-stage RAG security guard with delimiter isolation and canary tokens.
- **Privilege Separation**: Containers run as unprivileged users (`appuser` UID 10001, `nginx-unprivileged`).

---

## License

Proprietary & Confidential - RewardMatch AI Team.
