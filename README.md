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
- **Build Tool**: Vite

### Backend
- **Framework**: Python 3.11/3.12, Django 4.2+, Django REST Framework
- **Task Queue**: Celery & Redis
- **Security**: Argon2id password hashing, AES-256-GCM envelope encryption, SSRF protection, IDOR object-level authorization, strict CORS policy

### Database & Infrastructure
- **Database**: MySQL 8.0 (Production) with automatic zero-config SQLite fallback for local evaluation
- **Containerization**: Docker & Docker Compose
- **Network Isolation**: 4 segregated Docker networks (`edge`, `application`, `database`, `jobs`)

---

## Quickstart

### Prerequisites
- Node.js (v18+)
- Python 3.11+
- (Optional) MySQL 8.0+ / Docker

---

### Method 1: Local Development (Fastest, Zero MySQL Required)

You can run and test the complete application locally without installing or configuring MySQL:

1. **Clone and install dependencies**:
   ```bash
   git clone https://github.com/Ragavan-coder/RewardMatch-AI.git
   cd RewardMatch-AI
   pip install -r requirements.txt
   npm install
   ```

2. **Run Django Backend** (runs in local SQLite mode automatically when MySQL is not configured):
   ```bash
   cd django_backend
   python manage.py migrate
   python manage.py runserver 127.0.0.1:8000
   ```

3. **Run React Frontend**:
   ```bash
   npm run dev
   ```
   Open [http://127.0.0.1:5173](http://127.0.0.1:5173) in your browser.

---

### Method 2: Production Setup with MySQL

1. **Copy environment variables**:
   ```bash
   cp .env.example .env
   ```
   Configure your MySQL credentials in `.env` (`MYSQL_DATABASE`, `MYSQL_USER`, `MYSQL_PASSWORD`, etc.).

2. **Run migrations and server**:
   ```bash
   cd django_backend
   pip install -r requirements.txt
   python manage.py migrate
   python manage.py runserver 127.0.0.1:8000
   ```

---

### Method 3: Docker Compose (Full Stack Isolated Deployment)

```bash
docker compose up --build
```
This launches 4 isolated networks:
- Ingress Nginx Proxy: [http://localhost:8080](http://localhost:8080)
- Django Backend: Port 8000 (Internal application network)
- MySQL Database: Port 3306 (Internal database network)
- Celery + Redis: Internal jobs network

---

## Testing & Build Verification

### Backend Tests (Django & Security Regression Suite)
```bash
python django_backend/manage.py test apps.security_audit.tests apps.transactions.tests apps.accounts.tests
```
*Runs all 11 unit and security regression tests testing Argon2id hashing, SSRF prevention, AES-256-GCM envelope encryption, IDOR guards, and Decimal accuracy.*

### Frontend Production Build
```bash
npm run build
```
*Compiles TypeScript (`tsc -b`) and generates optimized production bundle with zero warnings or errors.*

---

## Security Architecture

- **Authentication Required by Default**: Django REST Framework default permission is strictly `IsAuthenticated`. Only public catalogs and login/registration endpoints are exposed.
- **Strict CORS Policy**: `CORS_ALLOW_ALL_ORIGINS = False` with restricted whitelist.
- **Envelope Encryption**: AES-256-GCM with HKDF key derivation protects all card and banking metadata at rest.
- **SSRF Defense**: Strict URL validation, DNS re-resolution checks, and private IP blocking for merchant monitoring feeds.
- **Prompt Injection Defense**: Multi-stage RAG security guard with delimiter isolation and canary tokens.
- **Privilege Separation**: Containers run as unprivileged users (`appuser` UID 10001, `nginx-unprivileged`).

---

## License

Proprietary & Confidential - RewardMatch AI Team.
