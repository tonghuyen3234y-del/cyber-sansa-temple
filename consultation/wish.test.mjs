import assert from 'node:assert/strict';
import { once } from 'node:events';
import { createServer } from 'node:http';
import { test } from 'node:test';
import { createTempleServer } from '../server.mjs';
import {
  cardLineMax, detectThemes, fallbackCard, isCrisis, layoutCard, refineWish, titleFor,
} from '../public/consultation/text.js';

async function listen(t, server) {
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  t.after(() => new Promise(resolve => server.close(resolve)));
  return 'http://127.0.0.1:' + server.address().port;
}

function wish(origin, data) {
  return fetch(origin + '/api/consultation/wish', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

test('extracts a hangable wish, a plaque title and a matching theme', () => {
  const raw = '希望妈妈的身体能快点好起来，我已经很久没有睡好了。';
  assert.equal(refineWish(raw), '希望妈妈的身体能快点好起来');
  assert.equal(titleFor(raw), '妈妈');
  assert.deepEqual(detectThemes(raw), ['family', 'health', 'wish']);
  // 过长的句子按逗号合并，仍能刻上木牌
  const long = refineWish('我想要换一份工作，因为现在每天加班到很晚，身体也吃不消了');
  assert.ok([...long].length <= 24, long);
  assert.match(long, /^我想要换一份工作/);
  assert.equal(titleFor('要是能考上就好了'), '考上');
  assert.ok(['love', 'grief'].every(theme => detectThemes('我想起去世的奶奶，很想她').includes(theme)));
});

test('lays out model prose into balanced card lines without orphan fragments', () => {
  const lines = layoutCard('「睡不好」这几个字，我也看见了。你已经在替她承担很多。今晚先让自己睡一会儿，明天再想。');
  const rows = lines.split('\n');
  assert.equal(rows.length, 3);
  assert.equal(rows[0], '「睡不好」这几个字，我也看见了。');
  for (const row of rows) assert.ok([...row].length <= cardLineMax + 1, row);
  const split = layoutCard('你说的那句「我已经很努力了」，我听见了。若有人能在身边，就让他在。慢慢来。');
  assert.ok(split.split('\n').every(row => [...row].length <= cardLineMax + 1));
  assert.equal(layoutCard(''), '');
});

test('keeps the local card gentle, specific and free of predictions', () => {
  const card = fallbackCard('希望妈妈的身体能快点好起来，我已经很久没有睡好了');
  assert.equal(card.mode, 'reference');
  assert.equal(card.wish, '希望妈妈的身体能快点好起来');
  const rows = card.lines.split('\n');
  assert.ok(rows.length >= 3 && rows.length <= 5, card.lines);
  assert.ok(rows[0].startsWith('「'));
  for (const row of rows) assert.ok([...row].length <= cardLineMax * 2);
  // 不做命运预测，也不承诺愿望必然实现
  assert.doesNotMatch(card.lines, /一定会|必然|保证|命中注定|命中|吉凶|注定会/);
  assert.ok(card.verse && [...card.verse].length <= 34);
});

test('turns self-harm wording into a plain referral instead of a blessing', () => {
  assert.equal(isCrisis('我真的不想活了'), true);
  assert.equal(isCrisis('希望家人平安'), false);
  const card = fallbackCard('我不想活了，撑不下去了');
  assert.equal(card.verse, '先把灯留着');
  assert.match(card.lines, /12356/);
  assert.doesNotMatch(card.lines, /愿望|一定能/);
});

test('the wish endpoint returns a finished card and rejects malformed requests', async t => {
  const oldKey = process.env.DEEPSEEK_API_KEY;
  delete process.env.DEEPSEEK_API_KEY;
  t.after(() => { if (oldKey !== undefined) process.env.DEEPSEEK_API_KEY = oldKey; });
  const url = await listen(t, createTempleServer());

  const response = await wish(url, { wish: '我想和她说清楚那天的事，可是又怕说错话', name: '阿青' });
  const card = await response.json();
  assert.equal(response.status, 200);
  assert.equal(card.mode, 'reference');
  assert.equal(card.name, '阿青');
  assert.ok(card.lines.split('\n').length >= 3);
  assert.equal(card.wish, '我想和她说清楚那天的事');

  assert.equal((await wish(url, { wish: '' })).status, 400);
  assert.equal((await wish(url, { wish: '   ' })).status, 400);
  assert.equal((await wish(url, { wish: 'x'.repeat(400) })).status, 400);
  assert.equal((await fetch(url + '/api/consultation/wish')).status, 405);
  const wrongType = await fetch(url + '/api/consultation/wish', {
    method: 'POST', headers: { 'Content-Type': 'text/plain' }, body: 'hi',
  });
  assert.equal(wrongType.status, 400);
  const crisis = await (await wish(url, { wish: '我不想活了' })).json();
  assert.match(crisis.lines, /12356/);
});

test('the wish endpoint streams a mock model card without leaking the prompt', async t => {
  const captured = [];
  const mock = createServer(async (request, response) => {
    const chunks = [];
    for await (const chunk of request) chunks.push(chunk);
    captured.push(JSON.parse(Buffer.concat(chunks)));
    response.writeHead(200, { 'Content-Type': 'text/event-stream' });
    response.write('data: {"choices":[{"delta":{"content":"「睡不好」这几个字，我也看见了。"}}]}\n\n');
    response.write('data: {"choices":[{"delta":{"content":"今晚先让自己睡一会儿，明天再想。"}}]}\n\n');
    response.end('data: [DONE]\n\n');
  });
  const base = await listen(t, mock);
  const config = { DEEPSEEK_API_KEY: 'mock-only', DEEPSEEK_BASE_URL: base };
  for (const [name, value] of Object.entries(config)) {
    const old = process.env[name];
    process.env[name] = value;
    t.after(() => { if (old === undefined) delete process.env[name]; else process.env[name] = old; });
  }
  const url = await listen(t, createTempleServer());
  const response = await wish(url, { wish: '希望妈妈的身体能快点好起来，我已经很久没有睡好了', name: '阿青' });
  assert.equal(response.status, 200);
  const card = await response.json();
  assert.equal(card.mode, 'ai');
  assert.match(card.lines, /睡不好/);
  assert.match(card.lines, /今晚先让自己睡一会儿/);
  assert.ok(card.verse);
  // 提示词带着语气与边界要求，也带着心愿原文
  const instructions = captured[0].messages[0].content;
  assert.match(instructions, /不预测结果/);
  assert.match(instructions, /12356/);
  assert.match(instructions, /希望妈妈的身体能快点好起来/);
  assert.equal(captured[0].stream, true);
  assert.equal(captured[0].thinking.type, 'disabled');
  // 回复里不能把系统提示词原样回吐给客户端
  assert.doesNotMatch(JSON.stringify(card), /你是赛博山寺许愿树下的一位老僧/);
});
