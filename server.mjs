import { registerHooks } from 'node:module';
import { createServer } from 'node:http';
import { randomUUID } from 'node:crypto';
import { fileURLToPath, pathToFileURL } from 'node:url';
import sirv from 'sirv';
import { WebSocket, WebSocketServer } from 'ws';

// 浏览器端模块以 './text.js' 形式互相引用；服务端共用同一份文件，需补全扩展名。
if (typeof registerHooks === 'function') {
  registerHooks({
    resolve(specifier, context, nextResolve) {
      try {
        return nextResolve(specifier, context);
      } catch (error) {
        if (specifier.startsWith('.') && context.parentURL) {
          return { url: new URL(specifier + '.js', context.parentURL).href, shortCircuit: true };
        }
        throw error;
      }
    },
  });
}

const { createConsultationApi, loadConsultationEnv } = await import('./consultation/api.mjs');
const { createWishApi } = await import('./consultation/wish.mjs');

const capacity = 24;
const reservedCushions = new Set([12, 15, 17, 18]);
const names = ['松风', '明月', '清莲', '白露', '晨钟', '竹影', '听雨', '云水'];
const colors = ['#929c84', '#a39173', '#a98a67', '#8d9a98'];
const poses = new Set(['walk', 'kneel', 'beads', 'dance']);
const environmentModules = new Set([
  '/node_modules/@sparkjsdev/spark/dist/spark.module.min.js',
  '/node_modules/three/examples/jsm/postprocessing/Pass.js',
  '/node_modules/three/src/cameras/CubeCamera.js',
  '/node_modules/three/src/core/InstancedBufferGeometry.js',
  '/node_modules/three/src/core/Timer.js',
  '/node_modules/three/src/math/Matrix2.js',
  '/node_modules/three/src/renderers/WebGLArrayRenderTarget.js',
]);
const contentSecurity = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "media-src 'self' blob:",
  "worker-src 'self' blob:",
  "connect-src 'self' blob:",
  "form-action 'self'",
  "object-src 'none'",
  "base-uri 'none'",
].join('; ');

function send(socket, message) {
  if (socket.readyState !== WebSocket.OPEN) return;
  if (socket.bufferedAmount > 128 * 1024) {
    socket.terminate();
    return;
  }
  socket.send(JSON.stringify(message));
}

function update(room, message = { type: 'update', visitors: [...room.visitors.values()] }) {
  const payload = { ...message, room: room.id, serverTime: Date.now() };
  for (const socket of room.visitors.keys()) send(socket, payload);
}

function snapshot(room, socket, visitor) {
  send(socket, {
    type: 'snapshot',
    room: room.id,
    selfId: visitor.id,
    visitors: [...room.visitors.values()],
    serverTime: Date.now(),
  });
}

function spawn(room) {
  const positions = [...room.visitors.values()].map(visitor => visitor.position);
  for (let index = 0; index < capacity; index++) {
    const column = index % 9;
    const x = Math.ceil(column / 2) * (column % 2 ? -3.2 : 3.2);
    const z = index < 18 ? 18.8 - Math.floor(index / 9) * 3.2 : 30.4;
    if (positions.every(position => Math.hypot(x - position.x, z - position.z) > 1.06)) {
      return { x, z, yaw: 0 };
    }
  }
  return { x: 0, z: 34, yaw: 0 };
}

function nearestCushion(room, visitor) {
  const occupied = new Set([...room.visitors.values()].map(guest => guest.cushion));
  let distance = Infinity;
  let result = null;
  for (let index = 0; index < 100; index++) {
    if (reservedCushions.has(index) || occupied.has(index)) continue;
    const column = index % 10;
    const x = (column < 5 ? column - 5 : column - 4) * 2.4;
    const z = -8.4 + Math.floor(index / 10) * 2.8;
    const candidate = Math.hypot(x - visitor.position.x, z - visitor.position.z);
    if (candidate < distance) {
      distance = candidate;
      result = index;
    }
  }
  return result;
}

export function createTempleServer() {
  const rooms = new Map(Array.from({ length: 12 }, (_, index) => {
    const number = index + 1;
    const id = index ? `maru-${String(number).padStart(2, '0')}` : 'maru';
    return [id, { id, number, visitors: new Map() }];
  }));
  const consultation = createConsultationApi();
  const wish = createWishApi();
  const serve = sirv(fileURLToPath(new URL('./public/', import.meta.url)), { dev: true, etag: true });
  const serveEnvironmentModule = sirv(fileURLToPath(new URL('./', import.meta.url)), { dev: true, etag: true });
  const server = createServer((request, response) => {
    const url = new URL(request.url, 'http://localhost');
    response.setHeader('Content-Security-Policy', contentSecurity);
    response.setHeader('Referrer-Policy', 'no-referrer');
    response.setHeader('X-Content-Type-Options', 'nosniff');
    if (url.pathname === '/api/rooms' && request.method === 'GET') {
      const directory = [...rooms.values()].map(({ id, number, visitors }) =>
        ({ id, number, capacity, count: visitors.size }));
      response.writeHead(200, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
      response.end(JSON.stringify({ ok: true, rooms: directory, mode: 'self', capacity }));
      return;
    }
    if (consultation(request, response, url.pathname)) return;
    if (wish(request, response, url.pathname)) return;
    const serveFile = environmentModules.has(request.url.split('?')[0]) ? serveEnvironmentModule : serve;
    serveFile(request, response, () => {
      response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      response.end('页面不存在');
    });
  });

  const sockets = new WebSocketServer({ noServer: true, maxPayload: 2048 });
  server.on('upgrade', (request, socket, head) => {
    const url = new URL(request.url, 'http://localhost');
    const origin = request.headers.origin;
    // Permit CLI clients without Origin, and only same-host browser clients.
    if (url.pathname !== '/presence' ||
        (origin && !['http://', 'https://'].some(scheme => origin === scheme + request.headers.host))) {
      socket.destroy();
      return;
    }
    const id = url.searchParams.get('room');
    const room = id === 'auto'
      ? [...rooms.values()].find(candidate => candidate.visitors.size < capacity)
      : rooms.get(id);
    sockets.handleUpgrade(request, socket, head, client => {
      client.on('error', () => client.terminate());
      if (!room || room.visitors.size >= capacity) {
        const full = Boolean(room || id === 'auto');
        send(client, { type: 'error', code: full ? 'room-full' : 'invalid-room' });
        client.close(full ? 4009 : 4000);
        return;
      }

      const taken = new Set([...room.visitors.values()].map(visitor => visitor.seat));
      const seat = Array.from({ length: capacity }, (_, index) => index)
        .find(index => !taken.has(index));
      const name = names[seat % names.length] + (seat < names.length ? '' : ` · ${seat + 1}`);
      const visitor = {
        id: randomUUID(), seat, name, color: colors[seat % colors.length],
        joinedAt: Date.now(), cushion: null, position: spawn(room), pose: 'walk',
      };
      room.visitors.set(client, visitor);
      snapshot(room, client, visitor);
      update(room);

      let lastMove = 0;
      let lastEvent = 0;
      client.on('message', data => {
        let message;
        try { message = JSON.parse(data.toString()); } catch { return; }
        const now = Date.now();
        switch (message?.type) {
          case 'ping':
            send(client, { type: 'pong' });
            break;
          case 'sync':
            snapshot(room, client, visitor);
            break;
          case 'move': {
            const { x, z, yaw, pose } = message;
            if (now - lastMove < 120 || ![x, z, yaw].every(Number.isFinite) ||
                Math.abs(x) > 250 || Math.abs(z) > 250 || !poses.has(pose)) return;
            lastMove = now;
            visitor.position = { x, z, yaw };
            visitor.pose = pose;
            update(room);
            break;
          }
          case 'seat':
            if (!Number.isSafeInteger(message.requestId)) return;
            visitor.cushion ??= nearestCushion(room, visitor);
            send(client, visitor.cushion === null
              ? { type: 'seat-unavailable', requestId: message.requestId }
              : { type: 'seat-granted', requestId: message.requestId, seat: visitor.cushion });
            update(room);
            break;
          case 'stand':
            visitor.cushion = null;
            visitor.pose = 'walk';
            delete visitor.bowAt;
            update(room);
            break;
          case 'hello':
          case 'bead':
          case 'bow':
            if (now - lastEvent < 180) return;
            lastEvent = now;
            if (message.type === 'bow') {
              visitor.pose = 'kneel';
              visitor.bowAt = now;
              update(room);
            }
            update(room, { type: 'event', event: { type: message.type, id: visitor.id } });
            break;
        }
      });
      client.on('close', () => {
        room.visitors.delete(client);
        update(room);
      });
      client.alive = true;
      client.on('pong', () => { client.alive = true; });
    });
  });

  const heartbeat = setInterval(() => {
    for (const client of sockets.clients) {
      if (!client.alive) client.terminate();
      else {
        client.alive = false;
        client.ping();
      }
    }
  }, 30_000);
  heartbeat.unref();
  server.on('close', () => {
    clearInterval(heartbeat);
    for (const client of sockets.clients) client.terminate();
    sockets.close();
  });
  return server;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  loadConsultationEnv();
  const port = Number(process.env.PORT ?? 4183);
  const host = process.env.HOST ?? '127.0.0.1';
  createTempleServer().listen(port, host, () => console.log(`赛博山寺 http://${host}:${port}/`));
}
