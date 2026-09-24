# Tienda Checkout — Fullstack
# Tienda Checkout — Fullstack

Aplicación web fullstack para la compra y pago de un producto a través de una pasarela de pagos (entorno Sandbox / UAT). Cubre todo el flujo de *onboarding* de compra: catálogo → datos de tarjeta y envío → resumen → procesamiento del pago → confirmación con actualización de inventario.

- **Backend:** NestJS + Arquitectura Hexagonal (Ports & Adapters) + Railway Oriented Programming (ROP) + PostgreSQL.
- **Frontend:** React + TypeScript + Redux Toolkit (Flux), mobile-first, resiliente a recargas.

## 🚀 Aplicación desplegada

| Recurso | Enlace |
| :--- | :--- |
| **App en vivo** | https://fullstackfecc.duckdns.org |
| **API (health)** | https://fullstackfecc.duckdns.org/api/health |
| **Swagger / OpenAPI** | https://fullstackfecc.duckdns.org/api/docs |
| **Repositorio** | https://github.com/facastillo942024/FullStackTest1 |

> Infraestructura: VPS Linode (Ubuntu 24.04) · Nginx como proxy inverso · SSL con Let's Encrypt · backend gestionado con PM2 · PostgreSQL 16.

**Tarjetas de prueba (Sandbox):** `4242 4242 4242 4242` aprueba · `4111 1111 1111 1111` rechaza. Cualquier fecha futura y CVC de 3 dígitos.

Este repositorio contiene ambos proyectos. Cada uno tiene su propio README con detalle:

- [`backend/README.md`](./backend/README.md)
- [`frontend/README.md`](./frontend/README.md)

---

## Tabla de contenido

- [Arquitectura general](#arquitectura-general)
- [Modelo de datos](#modelo-de-datos)
- [Flujo de compra](#flujo-de-compra)
- [Estructura del repositorio](#estructura-del-repositorio)
- [Puesta en marcha local](#puesta-en-marcha-local)
- [Pruebas y cobertura](#pruebas-y-cobertura)
- [Documentación de la API](#documentación-de-la-api)
- [Seguridad](#seguridad)
- [Despliegue](#despliegue)

---

## Arquitectura general

```
┌──────────────────────────┐         ┌──────────────────────────────┐         ┌─────────────────┐
│  Frontend (React SPA)    │  HTTP   │  Backend (NestJS REST API)   │  HTTPS  │  Pasarela de     │
│  Redux Toolkit           │ ──────▶ │  Hexagonal + ROP             │ ──────▶ │  pagos (Sandbox) │
│  /api (proxy → backend)  │         │  /api                        │         │                 │
└──────────────────────────┘         └───────────────┬──────────────┘         └─────────────────┘
                                                      │ TypeORM
                                                      ▼
                                              ┌───────────────┐
                                              │  PostgreSQL   │
                                              └───────────────┘
```

El backend aísla el dominio de todo lo externo mediante **puertos** (interfaces) implementados por **adaptadores** (TypeORM, pasarela, config). Los casos de uso se expresan con **ROP**: cada operación devuelve un `Result<T, E>` y la primera falla corta la cadena sin lanzar excepciones.

El frontend implementa el flujo como una **máquina de estados** en Redux y persiste el progreso en `localStorage` (sin datos de tarjeta).

---

## Modelo de datos

```mermaid
erDiagram
    CUSTOMER ||--o{ DELIVERY : tiene
    CUSTOMER ||--o{ TRANSACTION : realiza
    PRODUCT  ||--o{ TRANSACTION : es_comprado_en
    DELIVERY ||--o{ TRANSACTION : se_entrega_en

    PRODUCT {
        uuid id PK
        varchar name
        text description
        int price_in_cents
        int stock
        varchar image_url
        timestamptz created_at
    }
    CUSTOMER {
        uuid id PK
        varchar full_name
        varchar email
        varchar phone_number
        timestamptz created_at
    }
    DELIVERY {
        uuid id PK
        uuid customer_id FK
        varchar address_line
        varchar city
        varchar region
        varchar postal_code
        timestamptz created_at
    }
    TRANSACTION {
        uuid id PK
        varchar wompi_transaction_id
        uuid customer_id FK
        uuid product_id FK
        uuid delivery_id FK
        int quantity
        int amount_in_cents
        int base_fee_in_cents
        int delivery_fee_in_cents
        enum status
        timestamptz created_at
        timestamptz updated_at
    }
```

`status` ∈ `{ PENDING, APPROVED, DECLINED, ERROR }`. Todos los montos se guardan en **centavos** (enteros) para evitar errores de redondeo.

---

## Flujo de compra (5 pasos)

1. **Catálogo** — producto, descripción, precio y stock disponible.
2. **Modal de pago y envío** — datos de tarjeta (validación Luhn + detección de franquicia Visa/MasterCard) y datos de cliente/entrega. Al confirmar, el backend crea una transacción `PENDING`.
3. **Resumen (backdrop)** — desglose: valor del producto + tarifa base + costo de envío.
4. **Procesamiento** — el backend obtiene el token de aceptación, tokeniza la tarjeta, firma la integridad (`SHA256`), crea la transacción en la pasarela y consulta su estado final. Si aprueba, descuenta stock.
5. **Resultado** — Aprobado / Rechazado / Error, y retorno al catálogo con el inventario actualizado.

---

## Estructura del repositorio

```
.
├── backend/            # API NestJS (hexagonal + ROP)
│   ├── src/
│   │   ├── domain/         # entidades, value objects, errores, Result (ROP), puertos
│   │   ├── application/    # casos de uso
│   │   ├── infrastructure/ # TypeORM, pasarela, adaptadores, config, seed
│   │   └── interfaces/http/# controllers, DTOs, presenters, filtro de errores
│   └── README.md
├── frontend/           # SPA React + Redux Toolkit
│   ├── src/
│   │   ├── domain/         # validaciones (Luhn, franquicia), formato de dinero
│   │   ├── api/            # cliente axios y servicios
│   │   ├── store/          # slices, persistencia localStorage
│   │   ├── components/     # UI reutilizable
│   │   └── screens/        # las 5 pantallas del flujo
│   └── README.md
└── README.md           # este archivo
```

---

## Puesta en marcha local

### Requisitos
- Node.js 20+
- PostgreSQL 14+

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env         # ajusta credenciales de BD y de la pasarela
createdb checkout_db          # crea la base de datos
npm run seed                  # inserta productos de prueba
npm run start:dev             # http://localhost:3000/api
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev                   # http://localhost:5173  (proxy /api → :3000)
```

Abre **http://localhost:5173**. En el checkout puedes usar las tarjetas de prueba del Sandbox:

| Tarjeta | Resultado |
| :--- | :--- |
| `4242 4242 4242 4242` | Aprobada (APPROVED) |
| `4111 1111 1111 1111` | Rechazada (DECLINED) |

Cualquier fecha de expiración futura y CVC de 3 dígitos son válidos.

---

## Pruebas y cobertura

Ambos proyectos superan el mínimo del 80 % de cobertura exigido.

| Proyecto | Statements | Branches | Functions | Lines | Pruebas |
| :--- | :---: | :---: | :---: | :---: | :---: |
| Backend | 98.56 % | 85.61 % | 99.20 % | 98.58 % | 124 |
| Frontend | 97.84 % | 89.18 % | 96.66 % | 98.22 % | 91 |

```bash
# Backend
cd backend && npm run test:cov

# Frontend
cd frontend && npm run test:cov
```

---

## Documentación de la API

Con el backend corriendo:

- **Swagger UI:** http://localhost:3000/api/docs
- **OpenAPI JSON:** http://localhost:3000/api/docs-json (importable a Postman con *Import → Link*).

### Endpoints

| Método | Ruta | Descripción |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Liveness probe |
| `GET` | `/api/products` | Lista de productos |
| `GET` | `/api/products/:id` | Detalle de un producto |
| `POST` | `/api/transactions` | Crea una transacción `PENDING` |
| `POST` | `/api/transactions/:id/pay` | Procesa el pago |
| `GET` | `/api/transactions/:id` | Estado de una transacción |

---

## Seguridad

- **Helmet** para cabeceras de seguridad (baseline OWASP) y **HTTPS** en producción.
- **Validación de entrada** con `class-validator`.
- Los **datos de tarjeta no se persisten** en base de datos ni en `localStorage`; solo se reenvían a la pasarela para su tokenización.
- **Firma de integridad** `SHA256` en la creación de la transacción.
- **CORS** restringido por lista de orígenes configurable.

---

## Despliegue

La aplicación se despliega tras **Nginx** como proxy inverso con SSL (Let's Encrypt):

- `/api/` → backend NestJS (`http://localhost:3000`)
- `/` → build estático del frontend

### Entorno de producción actual

La aplicación está desplegada y operativa en un **VPS Linode (Ubuntu 24.04)**:

- **Node.js 20 LTS** + **PM2** manteniendo el backend (`checkout-api`) como servicio con auto-arranque en el reinicio.
- **PostgreSQL 16** con base `checkout_db` y usuario dedicado `checkout_user`.
- **Nginx 1.24** como proxy inverso.
- **SSL/TLS** con Let's Encrypt (Certbot) sobre `fullstackfecc.duckdns.org`.

Mapeo de Nginx:

```nginx
server {
    server_name fullstackfecc.duckdns.org;
    root /var/www/checkout-app/frontend/dist;
    index index.html;

    location /api/ {
        proxy_pass http://localhost:3000/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location / {
        try_files $uri $uri/ /index.html;   # SPA fallback
    }

    listen 443 ssl;                          # managed by Certbot
    # ... certificados Let's Encrypt ...
}
```

### Pasos de despliegue (reproducibles)

```bash
# 1. Dependencias del sistema
curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && apt install -y nodejs
npm install -g pm2
apt install -y postgresql postgresql-contrib

# 2. Base de datos
sudo -u postgres psql -c "CREATE USER checkout_user WITH PASSWORD '***';"
sudo -u postgres psql -c "CREATE DATABASE checkout_db OWNER checkout_user;"

# 3. Código
git clone <repo> /var/www/checkout-app && cd /var/www/checkout-app

# 4. Backend
cd backend && npm ci --include=dev
cp .env.example .env    # ajustar credenciales de producción
npm run build && npm run seed
pm2 start dist/main.js --name checkout-api && pm2 save
pm2 startup systemd -u root --hp /root

# 5. Frontend
cd ../frontend && npm ci --include=dev && npm run build

# 6. Nginx + SSL (server block anterior) y recarga
nginx -t && systemctl reload nginx
```

### Actualizar el despliegue (deploy de nuevos cambios)

```bash
cd /var/www/checkout-app && git pull
cd backend  && npm ci --include=dev && npm run build && pm2 restart checkout-api
cd ../frontend && npm ci --include=dev && npm run build && systemctl reload nginx
```
