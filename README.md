# Catálogo de E-commerce

Aplicação full stack para gerenciamento de catálogo de produtos com autenticação.

---

## 🚀 Tecnologias utilizadas

### Backend
- Laravel 13
- Laravel Sanctum
- MySQL 8.0
- PHP 8.4

### Frontend
- React
- Vite
- Axios

### Infraestrutura
- Docker
- Docker Compose

---

## 📦 Funcionalidades

- Registro e login com autenticação via token (Sanctum)
- CRUD de categorias com paginação
- CRUD de produtos com paginação
- Filtro de produtos por categoria
- Busca de produtos por nome ou descrição
- Visualização detalhada de produto com imagem
- Edição e exclusão de produtos e categorias

---

## 🏗️ Estrutura do backend

O backend foi organizado utilizando:

- Controllers
- Services
- Repositories

---

## 🐳 Como executar com Docker (recomendado)

### Pré-requisitos
- [Docker](https://www.docker.com/)
- [Docker Compose](https://docs.docker.com/compose/)

### Passos

```bash
# Clone o repositório
git clone https://github.com/BrunoDelfim/CASE-DESENVOLVEDOR-FULL-STACK-WEB-INSIGHTFUL.git
cd CASE-DESENVOLVEDOR-FULL-STACK-WEB-INSIGHTFUL

# Suba os containers
docker compose up --build
```

Aguarde todos os serviços iniciarem. O backend roda as migrations automaticamente.

| Serviço  | URL                   |
|----------|-----------------------|
| Frontend | http://localhost:5173 |
| Backend  | http://localhost:8000 |

Para encerrar:
```bash
docker compose down
```

---

## 🔐 Rotas principais da API

### Autenticação

| Método | Rota           | Descrição         |
|--------|----------------|-------------------|
| POST   | /api/register  | Cadastrar usuário |
| POST   | /api/login     | Fazer login       |
| POST   | /api/logout    | Fazer logout      |

### Categorias *(requer autenticação)*

| Método | Rota                  | Descrição              |
|--------|-----------------------|------------------------|
| GET    | /api/categories       | Listar categorias      |
| POST   | /api/categories       | Criar categoria        |
| GET    | /api/categories/{id}  | Detalhar categoria     |
| PUT    | /api/categories/{id}  | Atualizar categoria    |
| DELETE | /api/categories/{id}  | Excluir categoria      |

### Produtos *(requer autenticação)*

| Método | Rota               | Descrição           |
|--------|--------------------|---------------------|
| GET    | /api/products      | Listar produtos     |
| POST   | /api/products      | Criar produto       |
| GET    | /api/products/{id} | Detalhar produto    |
| PUT    | /api/products/{id} | Atualizar produto   |
| DELETE | /api/products/{id} | Excluir produto     |

### Filtros disponíveis

```
GET /api/products?category_id=1
GET /api/products?search=camiseta
GET /api/products?category_id=1&search=camiseta&page=2
```

---

## 🔑 Autenticação

As rotas protegidas utilizam Bearer Token via Laravel Sanctum.

Exemplo de header:

```
Authorization: Bearer SEU_TOKEN
Accept: application/json
```

---

## 🗂️ Estrutura do projeto

```
CASE-DESENVOLVEDOR-FULL-STACK-WEB-INSIGHTFUL/
├── api/          # Backend Laravel
├── frontend/     # Frontend React
└── docker-compose.yml
```
