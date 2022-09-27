FROM node:16-alpine AS install

WORKDIR app
COPY package.json tsconfig.json package-lock.json ./
RUN npm ci

EXPOSE 3000
CMD ["npm", "run", "start"]

FROM node:16-alpine AS build

WORKDIR app
COPY --from=install app/ ./
COPY public/ public/
COPY src/ src/
RUN npm run build

FROM nginx:alpine AS release

COPY --from=build app/build/ /usr/share/nginx/html/

EXPOSE 80
