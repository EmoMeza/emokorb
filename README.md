<div align="center">
  <img src="emokorb.png" alt="EmoKorb" width="120" style="border-radius:24px" />
  <h1>EmoKorb</h1>
  <p><strong>Collaborative grocery list app — real-time, mobile-first, self-hosted</strong></p>

  ![Node.js](https://img.shields.io/badge/Node.js-22-339933?logo=node.js&logoColor=white)
  ![Angular](https://img.shields.io/badge/Angular-21-DD0031?logo=angular&logoColor=white)
  ![MongoDB](https://img.shields.io/badge/MongoDB-7-47A248?logo=mongodb&logoColor=white)
  ![Socket.io](https://img.shields.io/badge/Socket.io-4-010101?logo=socket.io&logoColor=white)
  ![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)
</div>

---

## What is EmoKorb?

EmoKorb is a full-stack collaborative grocery list application built for personal use and self-hosting. Multiple users can share lists in real time — add products, update prices and quantities, and finalize a purchase together, all from their phones.

---

## Features

- **Real-time collaboration** — multiple users edit the same list simultaneously via WebSockets; changes appear instantly without refreshing
- **Inline editing** — tap any product's price or quantity directly in the table; changes save on blur with immediate local feedback
- **Smart product sorting** — products with price and quantity filled move to the bottom with a green checkmark; pending ones stay on top
- **List finalization** — closing a list opens a summary modal with a receipt photo upload (stored server-side via GridFS)
- **Copy from past lists** — create a new list using a finalized one as a template (copies products + quantities, not prices)
- **Friends & sharing** — add friends by username or email; share any list as a collaborator
- **Role-based access control** — two roles: `usuario` (manages own lists) and `administrador` (full user management panel)
- **Receipt viewer** — view uploaded receipt photos inside an image modal
- **Light / Dark mode** — manual toggle + respects system preference, persisted in localStorage
- **Mobile-first PWA-style UI** — bottom tab bar on mobile, responsive on all screen sizes
- **User limit** — capped at 10 accounts to prevent abuse on self-hosted instances

---

## Tech Stack

### Backend
| Technology | Role |
|---|---|
| **Node.js 22** + **Express 5** | REST API server; async errors auto-caught |
| **MongoDB 7** + **Mongoose 8** | Database + ODM; subdocument schemas for products |
| **Socket.io 4** | WebSocket server; JWT-authenticated rooms per list |
| **GridFS** (MongoDB) | Binary storage for receipt photos |
| **JWT** (jsonwebtoken) | Stateless authentication; Bearer token pattern |
| **bcrypt** | Password hashing with 12 salt rounds |
| **RBAC middleware** | `requireAuth`, `requireRole`, `requireListaAccess`, `requireOwner` |
| **pnpm** | Package manager |

### Frontend
| Technology | Role |
|---|---|
| **Angular 21** | Standalone components, signals, computed, lazy-loaded routes |
| **CSS (no framework)** | Pure CSS with custom properties for theming |
| **Socket.io client** | Real-time updates via WebSocket rooms |
| **Google Fonts** | Syne (headings) + Plus Jakarta Sans (body) |
| **pnpm** | Package manager |

### Infrastructure
| Technology | Role |
|---|---|
| **Docker** + **Docker Compose** | Containerized deployment |
| **nginx:alpine** | Serves the built Angular SPA (inside Docker) |
| **Nginx Proxy Manager** | External reverse proxy + SSL termination |
| **MongoDB** | Runs in isolated Docker network; no host exposure |

---

## Architecture

```
┌─────────────────────────────────────────────┐
│              Nginx Proxy Manager             │
│   compras.emomeza.com → frontend:80 (8080)  │
│   apicompras.emomeza.com → backend:3000     │
└──────────────┬──────────────────┬───────────┘
               │                  │
     ┌─────────▼───────┐  ┌───────▼────────┐
     │  nginx:alpine   │  │  Node/Express  │
     │  (Angular SPA)  │  │  + Socket.io   │
     └─────────────────┘  └───────┬────────┘
                                  │
                          ┌───────▼────────┐
                          │   MongoDB 7    │
                          │ (GridFS for    │
                          │  receipts)     │
                          └────────────────┘
```

**Request flows:**
- `GET /` → nginx serves Angular SPA → Angular Router handles client-side navigation
- `POST /api/auth/login` → Express → MongoDB → JWT response
- `PATCH /api/listas/:id/productos/:pid` → Express → MongoDB → Socket.io broadcasts `producto:editado` to all list room members
- `POST /api/listas/:id/boleta` → multer → GridFS → MongoDB

---

## Data Model

```
Usuario
  ├── username, email, nombre, apellido
  ├── password (bcrypt)
  ├── role: 'usuario' | 'administrador'
  └── amigos: [Usuario]

Lista
  ├── nombre, estado: 'activo' | 'finalizado'
  ├── owner: Usuario
  ├── colaboradores: [Usuario]
  ├── total (auto-calculated on save)
  ├── boleta (GridFS file ID)
  └── productos: [Producto]
        ├── nombre
        ├── precioUnitario, cantidad
        └── total (precioUnitario × cantidad)
```

---

## API Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/registro` | — | Register (username or email) |
| POST | `/api/auth/login` | — | Login with username **or** email |
| GET | `/api/usuarios/perfil` | ✓ | Own profile + friends |
| PATCH | `/api/usuarios/password` | ✓ | Change own password |
| GET | `/api/usuarios/buscar?q=` | ✓ | Search users |
| POST/DELETE | `/api/usuarios/amigos/:id` | ✓ | Add / remove friend |
| GET/POST | `/api/listas` | ✓ | List / create lists |
| GET/PATCH/DELETE | `/api/listas/:id` | ✓ | Get / edit / delete list |
| POST/DELETE | `/api/listas/:id/colaboradores/:uid` | owner | Share / unshare |
| POST/GET | `/api/listas/:id/boleta` | ✓ | Upload / download receipt |
| POST/PATCH/DELETE | `/api/listas/:id/productos` | ✓ | Product CRUD |
| GET | `/api/admin/usuarios` | admin | List all users |
| POST/PATCH/DELETE | `/api/admin/usuarios/:id` | admin | User management |

---

## WebSocket Events

| Event | Direction | Payload |
|---|---|---|
| `lista:join` | client → server | `listaId` |
| `lista:leave` | client → server | `listaId` |
| `producto:agregado` | server → room | `{ producto }` |
| `producto:editado` | server → room | `{ producto }` |
| `producto:eliminado` | server → room | `{ pid }` |
| `lista:actualizada` | server → room | `lista` |

---

## Running Locally

**Prerequisites:** Docker, pnpm

```bash
# Clone and install
git clone https://github.com/emiliomeza/emokorb
cd emokorb

# Start MongoDB
docker compose up -d

# Backend
cd backend
cp .env.example .env   # edit JWT_SECRET
pnpm install
pnpm dev

# Frontend (new terminal)
cd frontend
pnpm install
pnpm start
```

App at `http://localhost:4200` — default admin: `admin` / `admin`

---

## Production Deployment

Requires Docker + an external reverse proxy (e.g. Nginx Proxy Manager).

```bash
# Create .env at project root
echo "JWT_SECRET=$(openssl rand -hex 32)" > .env
echo "FRONTEND_URL=https://compras.yourdomain.com" >> .env

# Build and start
docker compose -f docker-compose.prod.yml up -d --build
```

Configure your reverse proxy:
- `compras.yourdomain.com` → `localhost:8080` (Angular SPA)
- `apicompras.yourdomain.com` → `localhost:3000` (API + WebSocket)

---

## Project Structure

```
├── backend/
│   ├── src/
│   │   ├── config/       # DB connection, GridFS, seed
│   │   ├── controllers/  # auth, lista, producto, usuario, admin
│   │   ├── middlewares/  # auth (JWT), RBAC, lista access
│   │   ├── models/       # Usuario, Lista (Mongoose)
│   │   ├── routes/
│   │   ├── socket.js     # Socket.io setup + JWT auth
│   │   └── server.js
│   └── Dockerfile
├── frontend/
│   └── src/
│       ├── app/
│       │   ├── core/         # services, interceptors, guards
│       │   ├── pages/        # listas, lista-detalle, perfil, admin, auth
│       │   └── shared/       # models, layout component
│       ├── environments/
│       └── styles.css        # design system (CSS custom properties)
├── docker/
│   └── nginx.conf            # SPA nginx config (baked into image)
├── Dockerfile.nginx          # multi-stage: builds Angular + nginx
├── docker-compose.yml        # dev (MongoDB only)
└── docker-compose.prod.yml   # prod (mongo + backend + frontend)
```

---

<div align="center">
  <sub>Built by <strong>Emilio Meza</strong> · Full-stack personal project</sub>
</div>
