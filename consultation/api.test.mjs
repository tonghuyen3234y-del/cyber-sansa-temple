import assert from 'node:assert/strict';
import { once } from 'node:events';
import { createServer } from 'node:http';
import { test } from 'node:test';
import { createTempleServer } from '../server.mjs';
import { createRituals } from './ritual.mjs';
import guanyin from './guanyin.json' with { type: 'json' };

async function listen(t, server) {
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  t.after(() => new Promise(resolve => server.close(resolve)));
  return 'http://127.0.0.1:' + server.address().port;
}

function post(origin, path, data) {
  return fetch(origin + '/api/consultation/' + path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}
async function events(response) {
  assert.equal(response.status, 200);
  return (await response.text()).split('\n').filter(line => line.startsWith('data: ')).map(line => JSON.parse(line.slice(6)));
}

test('requires both cups, issues one slip per draw, and reveals only the confirmed number', () => {
  const dice = [4, 0, 0, 4, 1, 1, 98, 1, 0];
  const ritual = createRituals(() => dice.shift());
  let state = ritual({ action: 'start', intention: '想安顿眼前的工作' });
  const act = (action, extra = {}) => ritual({ id: state.id, revision: state.revision, action, ...extra });
  assert.equal(state.phase, 'shake');
  assert.equal(act('cast').status, 409);
  state = act('draw');
  const rejected = state.number;
  assert.equal(state.card, undefined);
  assert.equal(act('claim', { number: rejected }).status, 409);
  const laugh = act('cast');
  assert.equal(laugh.result, 'laugh');
  assert.deepEqual(act('cast'), laugh); // retries cannot throw a different pair
  state = laugh;
  assert.equal(state.phase, 'shake');
  state = act('draw');
  assert.notEqual(state.number, rejected);
  state = act('cast');
  assert.equal(state.result, 'no');
  assert.equal(state.phase, 'shake');
  state = act('draw');
  assert.notEqual(state.number, rejected);
  state = act('cast');
  assert.equal(state.phase, 'claim');
  assert.equal(act('claim', { number: rejected }).status, 400);
  state = act('claim', { number: state.number });
  assert.equal(state.phase, 'complete');
  assert.equal(state.card.number, state.number);
  assert.equal(state.intention, '想安顿眼前的工作');
  assert.equal(state.card.number, 100);
  assert.equal(state.card.title, '三教談道');
});

test('answers without a topic and retrieves evidence on follow-up questions', async t => {
  const oldKey = process.env.DEEPSEEK_API_KEY;
  delete process.env.DEEPSEEK_API_KEY;
  t.after(() => { if (oldKey !== undefined) process.env.DEEPSEEK_API_KEY = oldKey; });
  const url = await listen(t, createTempleServer());
  assert.equal((await post(url, 'ritual', { action: 'start' })).status, 400);
  const tween = await fetch(url + '/consultation/vendor/tween.js');
  assert.match(tween.headers.get('content-type'), /text\/javascript/);
  assert.match(await tween.text(), /export.*Tween/);
  const entry = await (await post(url, 'ritual', { action: 'start', intention: '想安顿眼前的工作' })).json();
  assert.equal(entry.phase, 'shake');
  assert.equal((await post(url, 'ritual', { ...entry, action: 'cast' })).status, 409);
  const chat = await events(await post(url, 'chat', { question: '如何理解无常？' }));
  assert.equal(chat[0].items[0].title, '无常');
  assert.equal(chat.at(-1).mode, 'reference');
  const follow = await events(await post(url, 'chat', {
    question: '刚才那句能举个例子吗？', history: [{ role: 'user', content: '如何理解无常？' }],
  }));
  assert.equal(follow[0].items[0].title, '无常');
  const reading = await events(await post(url, 'reading', { number: 1, intention: '换工作', question: '可以先做什么？' }));
  assert.equal(reading.at(-1).mode, 'reference');
});

test('streams a mock model reply with prior turns and the exact selected fortune', async t => {
  const captured = [];
  const mock = createServer(async (request, response) => {
    const chunks = [];
    for await (const chunk of request) chunks.push(chunk);
    const data = JSON.parse(Buffer.concat(chunks));
    captured.push({ path: request.url, data });
    response.writeHead(200, { 'Content-Type': 'text/event-stream' });
    response.write('data: {"choices":[{"delta":{"content":"先看看"}}]}\n\n');
    response.end('data: {"choices":[{"delta":{"content":"当下可做的一件事。"}}]}\n\ndata: [DONE]\n\n');
  });
  const base = await listen(t, mock);
  const config = { DEEPSEEK_API_KEY: 'mock-only', DEEPSEEK_BASE_URL: base };
  for (const [name, value] of Object.entries(config)) {
    const old = process.env[name];
    process.env[name] = value;
    t.after(() => { if (old === undefined) delete process.env[name]; else process.env[name] = old; });
  }
  const url = await listen(t, createTempleServer());
  const history = [
    { role: 'user', content: '我在考虑换工作' },
    { role: 'assistant', content: '你看重这份工作里的什么？' },
  ];
  const chat = await events(await post(url, 'chat', { history, question: '我想多留一点时间给家人' }));
  assert.equal(chat.at(-1).mode, 'ai');
  assert.deepEqual(captured[0].data.messages.slice(1, 3).map(({ role, content }) => ({ role, content })), history);
  assert.equal(captured[0].path, '/chat/completions');
  assert.equal(captured[0].data.thinking.type, 'disabled');
  assert.equal(captured[0].data.stream, true);
  assert.equal(chat.filter(event => event.type === 'text').map(event => event.text).join(''), '先看看当下可做的一件事。');
  const reading = await events(await post(url, 'reading', {
    number: 1, intention: '想把误会说开', question: '我可以怎么开口？', history,
  }));
  assert.equal(reading.at(-1).mode, 'ai');
  assert.ok(captured[1].data.messages[0].content.includes('天開地闢作良緣'));
  assert.ok(captured[1].data.messages[0].content.includes('想把误会说开'));
  assert.deepEqual(captured[1].data.messages.slice(1, 3).map(({ role, content }) => ({ role, content })), history);
  assert.equal(captured[1].data.messages.at(-1).content, '我可以怎么开口？');
  assert.ok(captured[1].data.messages[0].content.includes('鍾離成道'));
  await events(await post(url, 'reading', { number: 1, edition: 'original', intention: '读取旧签' }));
  assert.ok(captured[2].data.messages[0].content.includes('风过竹林心自定'));
});

test('the Guanyin catalog maps 1 through 100 to one edition, with poem and commentary', () => {
  assert.equal(guanyin.length, 100);
  for (const [index, card] of guanyin.entries()) {
    assert.equal(card.number, index + 1);
    assert.equal(card.edition, 'guanyin-ctc');
    assert.match(card.grade, /^[上中下]籤$/);
    assert.equal(card.poem.split('\n').length, 4);
    assert.equal(card.meaning.split('\n').length, 4);
    assert.ok(card.title && card.sourceUrl.startsWith('https://www.ctc.org.hk/chim/'));
  }
  assert.equal(guanyin[49].title, '陶朱歸五湖');
});
