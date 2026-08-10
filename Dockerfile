FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .

ARG VITE_REDUX_SECRET_KEY
ARG VITE_API_URL
ARG VITE_PAYSTACK_PUBLIC_KEY

ENV VITE_REDUX_SECRET_KEY=$VITE_REDUX_SECRET_KEY
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_PAYSTACK_PUBLIC_KEY=$VITE_PAYSTACK_PUBLIC_KEY

RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
RUN npm install -g serve
COPY --from=build /app/dist ./dist

EXPOSE 3000
CMD ["serve", "-s", "dist", "-l", "3000"]
