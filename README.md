# 🎮 Fantasy RPG — API BPW

Projeto desenvolvido para a disciplina de **Banco de Dados, Programação e Servidores para Web (BPW)**, com temática de **Jogo de RPG**.

A API permite criar contas de jogadores, realizar autenticação com JWT, gerenciar personagens, cadastrar inimigos, realizar batalhas e enviar avatares para os personagens.

---

## 🚀 Funcionalidades

### 👤 Autenticação e Usuário

* Criação de usuário
* Login com JWT
* Consulta do usuário autenticado
* Atualização do usuário autenticado
* Exclusão do usuário autenticado
* Senhas armazenadas com hash utilizando bcrypt
* Proteção de rotas através de middleware JWT

### ⚔️ RPG

* Criar personagem
* Listar personagens do jogador logado
* Consultar personagem por ID
* Atualizar personagem
* Excluir personagem
* Cadastrar inimigos
* Listar inimigos
* Filtrar inimigos por nível
* Realizar ataques em batalhas
* Controle de HP
* Controle de ataque e defesa
* Controle de nível
* Registro das batalhas no banco de dados
* Upload de avatar/sprite do personagem

---

# 🛠️ Tecnologias

* Node.js
* TypeScript
* Express
* Prisma ORM
* MySQL
* JSON Web Token (JWT)
* bcryptjs
* Zod
* Multer

---

# 📁 Estrutura do Projeto

```text
api-rpg-bpw/
│
├── src/
│   ├── controllers/
│   │   ├── userController.ts
│   │   ├── rpgController.ts
│   │   └── uploadController.ts
│   │
│   ├── lib/
│   │   └── prisma.ts
│   │
│   ├── middleware/
│   │   ├── authMiddleware.ts
│   │   └── uploadMiddleware.ts
│   │
│   ├── routes/
│   │   ├── userRoutes.ts
│   │   └── rpgRoutes.ts
│   │
│   └── server.ts
│
├── prisma/
│   └── schema.prisma
│
├── uploads/
│
├── .env
├── .env.example
├── package.json
├── tsconfig.json
└── README.md
```

---

# ⚙️ Como executar o projeto

## 1. Instalar o Node.js

Utilize uma versão **LTS do Node.js**.

---

## 2. Instalar as dependências

Dentro da pasta do projeto:

```bash
npm install
```

Caso seja necessário instalar o Multer:

```bash
npm install multer
npm install -D @types/multer
```

---

## 3. Criar o banco de dados MySQL

No MySQL:

```sql
CREATE DATABASE rpg_bpw;
```

---

## 4. Configurar o `.env`

Crie um arquivo `.env` na raiz do projeto:

```env
PORT=3000

DATABASE_URL="mysql://root:SUA_SENHA@localhost:3306/rpg_bpw"

JWT_SECRET="chave-secreta-do-rpg"

JWT_EXPIRES_IN="1d"

UPLOAD_DIR="uploads"
```

> Se o MySQL local estiver configurado sem senha para o usuário `root`, utilize:

```env
DATABASE_URL="mysql://root:@localhost:3306/rpg_bpw"
```

---

## 5. Gerar o Prisma Client

```bash
npx prisma generate
```

---

## 6. Criar/aplicar as tabelas

```bash
npx prisma migrate dev
```

Ou, para uma nova migration:

```bash
npx prisma migrate dev --name init
```

---

## 7. Iniciar o servidor

```bash
npm run dev
```

Servidor:

```text
http://localhost:3000
```

Ao iniciar corretamente:

```text
Servidor do RPG rodando em http://localhost:3000
```

---

# 🔐 Autenticação

As rotas protegidas utilizam JWT.

Após realizar o login, a API retorna um `token`.

Nas requisições protegidas, enviar:

```text
Authorization: Bearer SEU_TOKEN
```

---

# 👤 Rotas de Usuário

## Criar usuário

**POST `/users`**

Rota pública.

### Body

```json
{
  "name": "Arthas",
  "email": "arthas@rpg.com",
  "password": "123456"
}
```

---

## Login

**POST `/login`**

Rota pública.

### Body

```json
{
  "email": "arthas@rpg.com",
  "password": "123456"
}
```

A resposta contém o JWT.

---

## Consultar usuário logado

**GET `/users/me`**

Rota protegida por JWT.

Header:

```text
Authorization: Bearer SEU_TOKEN
```

---

## Atualizar usuário

**PUT `/users/me`**

Rota protegida por JWT.

### Body

```json
{
  "name": "Arthas Paladino"
}
```

---

## Excluir usuário

**DELETE `/users/me`**

Rota protegida por JWT.

---

# ⚔️ Rotas de Personagem

Todas as rotas de personagem são protegidas por JWT.

## Criar personagem

**POST `/characters`**

### Body

```json
{
  "name": "Aragorn",
  "characterClass": "WARRIOR",
  "baseHp": 100,
  "baseAttack": 20
}
```

Classes disponíveis:

```text
WARRIOR
MAGE
ARCHER
```

O sistema inicializa automaticamente os atributos derivados:

* `level`
* `hp`
* `maxHp`
* `attack`
* `defense`

---

## Listar personagens

**GET `/characters`**

Retorna os personagens pertencentes ao jogador autenticado.

---

## Consultar personagem

**GET `/characters/:id`**

Exemplo:

```text
GET /characters/cmu4pvazk0002xelcgc3gbwi7
```

---

## Atualizar personagem

**PUT `/characters/:id`**

Rota protegida por JWT.

---

## Excluir personagem

**DELETE `/characters/:id`**

Rota protegida por JWT.

---

# 👹 Rotas de Inimigos

## Cadastrar inimigo

**POST `/enemies`**

Rota protegida por JWT.

### Body

```json
{
  "name": "Goblin",
  "level": 2,
  "maxHp": 100,
  "attackPower": 15,
  "defense": 5
}
```

O sistema inicializa o HP do inimigo com o valor de `maxHp`.

---

## Listar inimigos

**GET `/enemies`**

Exemplo:

```text
GET /enemies
```

---

## Filtrar inimigos por nível

**GET `/enemies?level=2`**

Exemplo:

```text
GET /enemies?level=2
```

A API retorna somente os inimigos correspondentes ao nível informado.

---

# 🎲 Sistema de Batalha

## Realizar ataque

**POST `/battles/attack`**

Rota protegida por JWT.

### Body

```json
{
  "characterId": "ID_DO_PERSONAGEM",
  "enemyId": "ID_DO_INIMIGO"
}
```

---

## Regra do dado

Durante o ataque, o servidor sorteia aleatoriamente um número entre:

```text
1 e 500
```

### Número PAR

Se o número sorteado for **par**:

```text
Ataque bem-sucedido
```

O valor sorteado é utilizado como dano contra o inimigo, limitado ao HP restante.

Exemplo:

```text
Dado: 76
Inimigo HP: 100

Dano: 76
Inimigo HP restante: 24
```

---

### Número ÍMPAR

Se o número sorteado for **ímpar**:

```text
Ataque falhou
```

O inimigo realiza um contra-ataque.

O dano do contra-ataque considera o ataque do inimigo e a defesa do personagem.

Exemplo:

```text
Dado: 481
Ataque do inimigo: 20
Defesa do personagem: 0

Dano recebido: 20
HP do personagem: 80
```

---

## Registro da batalha

Cada ataque é registrado no banco de dados contendo informações como:

* ID da batalha
* Personagem
* Inimigo
* Número sorteado
* Resultado do ataque
* Dano causado ao inimigo
* Dano causado ao personagem
* HP atual do personagem
* HP atual do inimigo
* Data da batalha

---

# 🖼️ Upload de Avatar

## Enviar avatar do personagem

**POST `/characters/:id/avatar`**

Rota protegida por JWT.

O upload utiliza **Multer** e aceita arquivos de imagem.

### Campo do formulário

```text
file
```

Exemplo utilizando `curl`:

```bash
curl -X POST http://localhost:3000/characters/ID_DO_PERSONAGEM/avatar -H "Authorization: Bearer SEU_TOKEN" -F "file=@aragorn.png"
```

O arquivo é armazenado no diretório configurado em:

```env
UPLOAD_DIR="uploads"
```

Após o upload, a API retorna uma URL pública semelhante a:

```text
http://localhost:3000/uploads/1789601668644-744950585.png
```

Os arquivos da pasta `uploads` são disponibilizados pelo Express através da rota:

```text
/uploads
```

---

# 🧪 Fluxo de teste

Para demonstrar o funcionamento da API:

### 1. Criar usuário

```text
POST /users
```

### 2. Fazer login

```text
POST /login
```

Copiar o JWT retornado.

### 3. Criar personagem

```text
POST /characters
```

### 4. Listar personagens

```text
GET /characters
```

### 5. Criar inimigo

```text
POST /enemies
```

### 6. Listar inimigos

```text
GET /enemies
```

### 7. Testar filtro

```text
GET /enemies?level=2
```

### 8. Realizar batalha

```text
POST /battles/attack
```

Utilizar:

```json
{
  "characterId": "ID_DO_PERSONAGEM",
  "enemyId": "ID_DO_INIMIGO"
}
```

### 9. Testar upload

```text
POST /characters/:id/avatar
```

### 10. Consultar personagem novamente

```text
GET /characters/:id
```

Verificar o campo:

```json
"avatarId": "http://localhost:3000/uploads/..."
```

---

# 🗄️ Banco de Dados

O projeto utiliza **MySQL** com **Prisma ORM**.

Principais entidades:

```text
User
 │
 ├── Character
 │
 └── Battle
       │
       ├── Character
       │
       └── Enemy
```

### User

Armazena os dados do jogador.

### Character

Armazena os personagens associados ao usuário.

### Enemy

Armazena os inimigos disponíveis para batalhas.

### Battle

Armazena o histórico dos ataques realizados.

---

# 🔒 Segurança

O projeto utiliza:

* JWT para autenticação
* bcryptjs para armazenamento seguro das senhas
* Zod para validação dos dados recebidos
* Middleware para proteção das rotas
* Verificação de propriedade dos personagens
* Limitação de tamanho dos arquivos enviados
* Restrição de tipos de arquivos de imagem no upload

---

# 📋 Tickets implementados

## TICKET-RPG-01 — Usuário e Personagem

* [x] Criar personagem autenticado
* [x] Relacionar personagem ao usuário
* [x] Validar classe do personagem
* [x] Retornar personagem criado

## TICKET-RPG-02 — Catálogo de Inimigos

* [x] `POST /enemies`
* [x] `GET /enemies`
* [x] Filtro por nível
* [x] Persistência no MySQL

## TICKET-RPG-03 — Sistema de Batalha

* [x] `POST /battles/attack`
* [x] JWT
* [x] Dado aleatório de 1 a 500
* [x] Regra par/ímpar
* [x] Ataque bem-sucedido
* [x] Contra-ataque
* [x] Controle de HP
* [x] Registro da batalha no MySQL

## TICKET-RPG-04 — Avatar/Sprite

* [x] Upload com Multer
* [x] Armazenamento na pasta `uploads`
* [x] URL pública
* [x] Associação do avatar ao personagem
* [x] Rota protegida por JWT

---

# 📌 Organização e padrões utilizados

* Rotas separadas dos controllers
* Middleware separado para autenticação
* Middleware separado para upload
* Prisma isolado em `src/lib`
* Validação de entrada utilizando Zod
* Senhas armazenadas com hash
* JWT para autenticação
* Relacionamentos entre entidades utilizando Prisma
* Banco de dados MySQL persistente
* Upload de imagens utilizando Multer
* Arquitetura organizada por responsabilidades

---

# 🎮 Projeto BPW — Fantasy RPG

API desenvolvida como projeto acadêmico para demonstrar conceitos de:

```text
Banco de Dados
+
Programação Web
+
Servidor Web
+
API REST
+
Autenticação
+
ORM
+
Upload de arquivos
+
Sistema de batalha
```
