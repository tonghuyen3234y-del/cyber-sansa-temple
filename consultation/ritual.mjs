import { randomInt, randomUUID } from 'node:crypto';
import fortunes from './guanyin.json' with { type: 'json' };

const ttl = 45 * 60_000;

export function createRituals(random = randomInt) {
  const sessions = new Map();
  return (input) => {
    const now = Date.now();
    for (const [id, ritual] of sessions) if (ritual.expires < now) sessions.delete(id);
    if (input.action === 'start') {
      const intention = typeof input.intention === 'string' ? input.intention.trim() : '';
      if (!intention || intention.length > 500) return { status: 400, error: '请先填写所求，最多 500 字。' };
      if (sessions.size >= 1000) return { status: 429, error: '请稍候片刻，再开始求签。' };
      const id = randomUUID();
      const ritual = { intention, phase: 'shake', number: null, previous: null, revision: 0, expires: now + ttl };
      sessions.set(id, ritual);
      return { id, phase: ritual.phase, revision: 0 };
    }

    const ritual = sessions.get(input.id);
    if (!ritual) return { status: 404, error: '这次求签已过期，请重新开始。' };
    if (input.revision === ritual.revision - 1 && input.action === ritual.last?.action &&
        input.number === ritual.last.number) return ritual.last.result;
    if (input.revision !== ritual.revision) return { status: 409, error: '求签进度已变动，请重新开始。' };
    let payload = {};
    if (input.action === 'cast' && ritual.phase === 'confirmation') {
      const faces = [random(2) === 0 ? 'flat' : 'round', random(2) === 0 ? 'flat' : 'round'];
      const result = faces[0] !== faces[1] ? 'yes' : faces[0] === 'flat' ? 'laugh' : 'no';
      if (result === 'yes') ritual.phase = 'claim';
      if (result !== 'yes') {
        ritual.previous = ritual.number;
        ritual.number = null;
        ritual.phase = 'shake';
      }
      payload = { faces, result };
    } else if (input.action === 'draw' && ritual.phase === 'shake') {
      const available = fortunes.filter(card => card.number !== ritual.previous);
      ritual.number = available[random(available.length)].number;
      ritual.phase = 'confirmation';
    } else if (input.action === 'claim' && ritual.phase === 'claim') {
      if (input.number !== ritual.number) return { status: 400, error: '请领取刚刚确认的签号。' };
      payload = { intention: ritual.intention, card: fortunes.find(card => card.number === ritual.number) };
      ritual.phase = 'complete';
    } else {
      return { status: 409, error: '请按当前步骤完成求签。' };
    }

    ritual.revision++;
    ritual.expires = now + ttl;
    const result = { id: input.id, phase: ritual.phase, revision: ritual.revision, number: ritual.number, ...payload };
    ritual.last = { action: input.action, number: input.number, result };
    return result;
  };
}
