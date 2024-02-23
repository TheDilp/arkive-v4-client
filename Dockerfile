FROM oven/bun:1 as base
WORKDIR /usr/src/app
ENV HUSKY=0
ENV NODE_ENV=production
COPY package.json bun.lockb /usr/src/app/
RUN bun install --production --force
COPY . .
# run the app
USER bun
EXPOSE 5173/tcp
ENTRYPOINT [ "bun", "start"]