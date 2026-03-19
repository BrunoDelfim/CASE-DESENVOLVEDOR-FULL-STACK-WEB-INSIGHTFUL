FROM node:20-alpine

WORKDIR /app

# Instala dependências primeiro (cache eficiente)
COPY package*.json ./
RUN npm install

# Copia o restante do projeto
COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
