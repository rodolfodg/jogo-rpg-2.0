# 🎮 Fantasy RPG — API BPW

Projeto de **Banco de Dados, Programação e Servidores para Web (BPW)** com tema de **Jogo de RPG**.

A API permite criar contas de jogadores, fazer login com JWT, gerenciar personagens, cadastrar inimigos e realizar ataques em batalhas.

## Funcionalidades

### Autenticação e usuário
- Criação de usuário
- Login
- Consulta do usuário logado com JWT
- Atualização do usuário com JWT
- Exclusão do usuário com JWT
- Senha armazenada com hash usando bcrypt

### RPG
- Criar personagem
- Listar personagens do jogador logado
- Consultar personagem
- Atualizar personagem
- Excluir personagem
- Listar inimigos
- Cadastrar inimigos
- Realizar ataque entre personagem e inimigo
- Controle de HP, ataque, defesa e nível

## Tecnologias

- Node.js
- TypeScript
- Express
- Prisma ORM
- MySQL
- JWT
- bcryptjs
- Zod

## Estrutura

```text
src/
├── controllers/
│   ├── userController.ts
│   └── rpgController.ts
├── lib/
│   └── prisma.ts
├── middleware/
│   └── authMiddleware.ts
├── routes/
│   ├── userRoutes.ts
│   └── rpgRoutes.ts
└── server.ts
prisma/
└── schema.prisma
```

## Como rodar

### 1. Instalar Node.js

Use uma versão LTS do Node.js.

### 2. Instalar dependências

Dentro da pasta do projeto:

```bash
npm install
```

### 3. Criar o banco MySQL

No MySQL:

```sql
CREATE DATABASE rpg_bpw;
```

### 4. Configurar o `.env`

Copie `.env.example` para `.env` e ajuste a senha do MySQL:

```env
PORT=3000
DATABASE_URL="mysql://root:SUA_SENHA@localhost:3306/rpg_bpw"
JWT_SECRET="chave-secreta-do-rpg"
JWT_EXPIRES_IN="1d"
```

### 5. Criar as tabelas

```bash
npx prisma generate
npx prisma migrate dev --name init
```

### 6. Iniciar

```bash
npm run dev
```

API: `http://localhost:3000`

## Rotas para apresentar no dia da avaliação

### Usuário

**Criar usuário — público**

`POST /users`

```json
{
  "name": "Arthas",
  "email": "arthas@rpg.com",
  "password": "123456"
}
```

**Login — público**

`POST /login`

```json
{
  "email": "arthas@rpg.com",
  "password": "123456"
}
```

Copie o `token` retornado.

Nas próximas requisições, use:

```text
Authorization: Bearer SEU_TOKEN
```

**Consultar jogador logado — protegido por JWT**

`GET /users/me`

**Atualizar jogador — protegido por JWT**

`PUT /users/me`

```json
{
  "name": "Arthas Paladino"
}
```

**Excluir jogador — protegido por JWT**

`DELETE /users/me`

## Rotas do RPG

**Criar personagem**

`POST /characters`

```json
{
  "name": "Arthas",
  "class": "Paladino",
  "level": 1,
  "maxHp": 120,
  "attack": 20,
  "defense": 10
}
```

**Listar personagens do jogador**

`GET /characters`

**Consultar personagem**

`GET /characters/:id`

**Atualizar personagem**

`PUT /characters/:id`

**Excluir personagem**

`DELETE /characters/:id`

**Listar inimigos**

`GET /enemies`

**Cadastrar inimigo**

`POST /enemies`

```json
{
  "name": "Goblin",
  "level": 1,
  "hp": 50,
  "attack": 8,
  "defense": 3
}
```

**Atacar inimigo**

`POST /battles/attack`

```json
{
  "characterId": "ID_DO_PERSONAGEM",
  "enemyId": "ID_DO_INIMIGO"
}
```

O servidor calcula o dano com base em ataque e defesa e atualiza o HP do personagem e do inimigo.

## Fluxo rápido para testar no Postman

1. `POST /users`
2. `POST /login`
3. Copiar o JWT
4. Criar um personagem em `POST /characters`
5. Criar um inimigo em `POST /enemies`
6. Usar os IDs em `POST /battles/attack`
7. Consultar `GET /characters` e `GET /enemies`
8. Demonstrar `PUT /users/me` e `DELETE /users/me` com JWT

## Organização e padrões

- Rotas separadas dos controllers
- Middleware separado para autenticação
- Prisma isolado em `src/lib`
- Validação de entrada com Zod
- Senhas com hash
- JWT para endpoints protegidos
- Relacionamento entre usuário e personagens
- Banco MySQL persistente
