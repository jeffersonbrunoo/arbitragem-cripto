# 📈 Arbitragem Cripto - Sistema de Monitoramento

![GitHub Repo stars](https://img.shields.io/github/stars/SEUUSUARIO/arbitragem-cripto?style=social)
![GitHub forks](https://img.shields.io/github/forks/SEUUSUARIO/arbitragem-cripto?style=social)
![GitHub issues](https://img.shields.io/github/issues/SEUUSUARIO/arbitragem-cripto)
![GitHub pull requests](https://img.shields.io/github/issues-pr/SEUUSUARIO/arbitragem-cripto)

Sistema fullstack para monitoramento de oportunidades de arbitragem entre preços Spot e Future de criptomoedas na corretora MEXC.

---

## 📦 Tecnologias Utilizadas

- **Frontend:** React + Vite + Bootstrap
- **Backend:** Node.js + Express
- **Banco de Dados:** MongoDB
- **Autenticação:** JWT (JSON Web Token)
- **Hospedagem:**
  - Frontend: Vercel
  - Backend: Railway ou Render

---

## 🚀 Funcionalidades Implementadas

- Registro de usuários com validação
- Login com token JWT
- Recuperação de senha via link por e-mail (em desenvolvimento)
- Redefinição de senha segura
- Dashboard de monitoramento de pares spot/future
- Atualização automática dos dados a cada 1 segundo
- Sistema de filtros de lucro mínimo, símbolo e intervalo
- Favoritos para salvar moedas preferidas
- Proteção de rotas com middleware de autenticação

---

## 🛠 Como Rodar Localmente

### 1. Clonar o projeto

```bash
git clone https://github.com/jimmyarbats/arbitragem-cripto.git
cd arbitragem-cripto
```

### 2. Instalar dependências

```bash
cd backend
npm install

cd ../frontend
npm install
```

### 3. Configurar variáveis de ambiente

Crie os arquivos `.env` na raiz do `backend/`:

```bash
PORT=5000
MONGODB_URI=mongodb://localhost:27017/arbitragem
JWT_SECRET=secreto123
```

(Para produção, variáveis separadas serão configuradas)

### 4. Rodar o projeto localmente

#### Usando Docker

```bash
docker-compose up
```

#### Sem Docker

Backend:
```bash
cd backend
npm run dev
```

Frontend:
```bash
cd frontend
npm run dev
```

Frontend estará acessível em:
```
http://localhost:5173
```
Backend em:
```
http://localhost:5000
```

---

## 🌐 Deploy em Produção

- Frontend hospedado na Vercel: [Deploy Frontend](https://vercel.com/)
- Backend hospedado na Railway ou Render: [Deploy Railway](https://railway.app/)
- Banco de dados no MongoDB Atlas
- Configuração segura de CORS e HTTPS

---

## 📋 Próximos Melhoramentos

- Envio real de e-mails de recuperação de senha
- Refresh token e armazenamento seguro
- Tela "Trocar minha senha" no dashboard
- Painel administrativo para gerenciamento de usuários
- Implementação de cache para API de preços (Redis)
- Sistema de favoritos completo e persistente

---

## 🤝 Contribuição

Fique à vontade para abrir issues ou pull requests. Melhorias são sempre bem-vindas!


