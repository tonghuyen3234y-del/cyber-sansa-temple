import assert from 'node:assert/strict';
import { once } from 'node:events';
import { test } from 'node:test';
import { WebSocket } from 'ws';
import { createTempleServer } from './server.mjs';

async function listen(t) {
  const server = createTempleServer().listen(0, '127.0.0.1');
  await once(server, 'listening');
  const origin = `http://127.0.0.1:${server.address().port}`;
  const peers = [];
  t.after(async () => {
    const closed = peers.map(({ socket }) => {
      if (socket.readyState === WebSocket.CLOSED) return;
      const done = once(socket, 'close');
      socket.terminate();
      return done;
    });
    await Promise.all(closed);
    await new Promise(resolve => server.close(resolve));
  });
  return {
    origin,
    directory: async () => (await fetch(`${origin}/api/rooms`)).json(),
    join(room) {
      const socket = new WebSocket(`${origin.replace(/^http/, 'ws')}/presence?room=${room}`, { origin });
      const messages = [];
      const changes = new EventTarget();
      socket.on('message', data => {
        messages.push(JSON.parse(data.toString()));
        changes.dispatchEvent(new Event('message'));
      });
      const peer = {
        socket,
        send: message => socket.send(JSON.stringify(message)),
        async wait(predicate) {
          const deadline = AbortSignal.timeout(2000);
          let result;
          while (!(result = messages.find(predicate))) {
            await once(changes, 'message', { signal: deadline });
          }
          return result;
        },
      };
      peers.push(peer);
      return peer;
    },
  };
}

const type = name => message => message.type === name;

test('joins a shared hall, synchronizes action and position, reserves seats and cleans up on exit', async t => {
  const app = await listen(t);
  const first = app.join('auto');
  const owner = await first.wait(type('snapshot'));
  const second = app.join('maru');
  const guest = await second.wait(type('snapshot'));
  assert.equal(guest.visitors.length, 2);
  assert.notEqual(guest.selfId, owner.selfId);
  await first.wait(message => message.type === 'update' && message.visitors.length === 2);
  first.send({ type: 'move', x: 2, z: 11, yaw: 1, pose: 'walk' });
  const visible = await second.wait(message => message.type === 'update' &&
    message.visitors.some(visitor => visitor.id === owner.selfId && visitor.position.x === 2));
  assert.equal(visible.visitors.find(visitor => visitor.id === owner.selfId).position.z, 11);

  first.send({ type: 'seat', requestId: 1 });
  second.send({ type: 'seat', requestId: 1 });
  const [a, b] = await Promise.all([first.wait(type('seat-granted')), second.wait(type('seat-granted'))]);
  assert.notEqual(a.seat, b.seat);
  first.send({ type: 'hello' });
  const hello = await second.wait(type('event'));
  assert.deepEqual(hello.event, { type: 'hello', id: owner.selfId });

  second.socket.close();
  await once(second.socket, 'close');
  await first.wait(message => message.type === 'update' && message.visitors.length === 1 &&
    message.visitors[0].position.x === 2);
  assert.equal((await app.directory()).rooms[0].count, 1);
  const transfer = app.join('maru-02');
  assert.equal((await transfer.wait(type('snapshot'))).room, 'maru-02');
});

test('enforces room capacity and admits automatic overflow to the next room', async t => {
  const app = await listen(t);
  const visitors = Array.from({ length: 24 }, () => app.join('maru'));
  await Promise.all(visitors.map(peer => peer.wait(type('snapshot'))));
  assert.equal((await app.directory()).rooms[0].count, 24);
  const rejected = app.join('maru');
  assert.equal((await rejected.wait(type('error'))).code, 'room-full');
  const overflow = app.join('auto');
  assert.equal((await overflow.wait(type('snapshot'))).room, 'maru-02');
});
