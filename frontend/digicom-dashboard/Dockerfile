FROM node:24-alpine AS build
WORKDIR /app

RUN npm install --global pnpm@12.9.1
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm build --configuration production

FROM nginx:stable-alpine AS runtime
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist/digicom-dashboard/browser/ /usr/share/nginx/html/

EXPOSE 80
