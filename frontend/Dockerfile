FROM node:18

WORKDIR /app

# Copia package.json e instala dependências
COPY package*.json ./
RUN npm install

# Copia o projeto todo (inclui src/, index.html, etc)
COPY . .

# ⬅️ Aqui você garante que o .env certo será usado no build
COPY .env.docker .env

# Executa o build de produção
RUN npm run build

# Instala servidor estático para servir o dist/
RUN npm install -g serve

EXPOSE 5173
CMD ["serve", "-s", "dist", "-l", "5173"]
