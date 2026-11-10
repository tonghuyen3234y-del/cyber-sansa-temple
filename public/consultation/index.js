import { approach, station, makeSeat } from './scene.js';
import { makePreview } from './preview.js';

const storageKey = 'sansa:consultation:saved:v1';
const memoryKey = 'sansa:consultation:chat:v1';
const icon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 10c4-1 7-4 9-7 2 3 5 6 9 7M5 12h14m-12 1v7m10-7v7m-12 0h14m-9-1v-4h4v4"/></svg>';

function readLocal(key) {
  try {
    const data = JSON.parse(localStorage.getItem(key) || '[]');
    return Array.isArray(data) ? data : [];
  } catch { return []; }
}

function validTurn(turn) {
  return ['user', 'assistant'].includes(turn?.role) && typeof turn.content === 'string';
}

function getSaved() {
  return readLocal(storageKey).filter(item => Number.isSafeInteger(item?.card?.number));
}

class ConsultationError extends Error {}

async function post(route, body, signal) {
  const response = await fetch('/api/consultation/' + route, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body), signal,
  });
  if (response.ok) return response;
  const error = await response.json().catch(() => null);
  throw new ConsultationError(error?.error || '连接暂时中断，请稍后再试。');
}

async function receive(route, body, signal, onEvent) {
  const response = await post(route, body, signal);
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const messages = buffer.split('\n\n');
      buffer = messages.pop();
      for (const message of messages) {
        if (!message.startsWith('data: ')) continue;
        const event = JSON.parse(message.slice(6));
        if (event.type === 'error') throw new ConsultationError(event.message);
        onEvent(event);
        if (event.type === 'done') return event.mode;
      }
    }
    throw new ConsultationError('这次回答中断了，可以再试一次。');
  } finally {
    await reader.cancel().catch(() => {});
    reader.releaseLock();
  }
}

function createPanel({ canvas, world, seat, show, hide }) {
  const dialog = document.createElement('dialog');
  dialog.className = 'game-dialog consultation-dialog';
  dialog.setAttribute('aria-labelledby', 'consultation-title');
  dialog.innerHTML = `
    <div class="consultation-frame">
    <header class="consultation-header">
      <div><p class="consultation-eyebrow">清缘堂 · 侧廊</p><h2 id="consultation-title">问心席</h2></div>
      <button type="button" class="dialog-close tool" data-close aria-label="关闭问心席"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg></button>
    </header>
    <nav class="consultation-tabs" aria-label="问心席功能">
      <button type="button" data-panel="chat">与师父聊聊</button>
      <button type="button" data-panel="fortune">摇签</button>
      <button type="button" data-panel="saved">签匣</button>
    </nav>
    <section data-view="chat">
      <div class="consultation-scroll">
      <div class="consultation-memory">
        <p class="consultation-note">近期对话保存在此浏览器。启用 AI 后，回答时会使用最近几轮对话。</p>
        <button type="button" data-clear-chat>清除记忆</button>
      </div>
      <div class="consultation-log" data-chat-log role="log" aria-label="和尚对话"></div>
      <p class="consultation-status" data-chat-status role="status"></p>
      </div>
      <form class="consultation-form consultation-composer" data-chat-form>
        <label class="sansa-sr" for="consultation-question">给师父的问题</label>
        <textarea id="consultation-question" maxlength="500" rows="2" placeholder="有什么想和师父说的？" required></textarea>
        <button class="solid-button" type="submit">发送</button>
      </form>
    </section>
    <section data-view="fortune" hidden>
      <div class="consultation-scroll">
      <form data-intention>
        <label class="consultation-question-label" for="consultation-fortune-question">这一次，想求问什么？</label>
        <textarea id="consultation-fortune-question" maxlength="500" rows="3" placeholder="例如：我想换工作，想先想清楚该准备什么。" required></textarea>
        <button type="submit" class="solid-button consultation-next">明确所求</button>
      </form>
      <p class="consultation-note" data-intention-summary hidden></p>
      <div class="consultation-ritual-actions">
        <div class="consultation-prop-stage" data-prop-stage hidden>
          <div class="consultation-grip" data-grip role="group" tabindex="0" hidden></div>
        </div>
        <p class="consultation-gesture-hint" data-gesture-hint hidden></p>
        <progress class="consultation-progress" max="100" value="0" aria-label="摇签进度" hidden></progress>
        <button type="button" class="consultation-link" data-claim hidden>重新载入签文</button>
      </div>
      <p class="consultation-status" data-draw-status role="status"></p>
      <article class="consultation-card" hidden>
        <div class="consultation-card-top"><span data-number></span><span data-grade></span></div>
        <h3 data-title></h3><p class="consultation-poem"></p><p data-meaning></p><a class="consultation-note" data-source target="_blank" rel="noopener noreferrer" hidden>查看签文底本</a>
        <div class="consultation-card-actions">
          <button type="button" class="solid-button" data-interpret>请师父解签</button>
          <button type="button" data-save>存入签匣</button>
        </div>
        <div class="consultation-reading" hidden>
          <div class="consultation-log" data-reading-log role="log" aria-label="解签对话"></div>
        </div>
      </article>
      <p class="consultation-note">掷杯和签文是民俗体验，吉凶等级用于读签与自我反思。</p>
      <button type="button" class="consultation-link" data-restart hidden>重新求签</button>
      </div>
      <form class="consultation-form consultation-composer" data-reading-form hidden>
            <label class="sansa-sr" for="consultation-followup">继续追问</label>
            <textarea id="consultation-followup" maxlength="500" rows="2" placeholder="想继续问这支签的什么？" required></textarea>
            <button class="solid-button" type="submit">追问</button>
      </form>
    </section>
    <section data-view="saved" hidden>
      <div class="consultation-scroll">
      <p class="consultation-note">签匣保存在当前浏览器，可随时回来翻看。</p>
      <div class="consultation-saved"></div>
      </div>
    </section>
    </div>
    <div class="consultation-reveal" data-reveal hidden>
      <section class="consultation-reveal-sheet" role="dialog" aria-modal="true" aria-labelledby="reveal-number">
        <div class="consultation-reveal-prop" data-reveal-prop></div>
        <p class="consultation-eyebrow">观音百签</p>
        <h3 id="reveal-number"></h3>
        <p data-reveal-poem></p>
        <button type="button" class="solid-button" data-collect>收下此签</button>
      </section>
    </div>
  `;
  document.body.append(dialog);
  const $ = selector => dialog.querySelector(selector);
  const all = selector => [...dialog.querySelectorAll(selector)];
  const chatInput = $('#consultation-question');
  const intentionInput = $('#consultation-fortune-question');
  const followup = $('#consultation-followup');
  const drawStatus = $('[data-draw-status]');
  const grip = $('[data-grip]');
  const frame = $('.consultation-frame');
  const stage = $('[data-prop-stage]');
  const reveal = $('[data-reveal]');
  const revealProp = $('[data-reveal-prop]');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let preview;
  let previewFailed = false;
  let collected = true;
  let flight;
  let pendingAction;
  let revealOrigin;
  let panel = 'chat';
  const progress = $('.consultation-progress');
  let chat = readLocal(memoryKey).filter(validTurn).slice(-16);
  let ritual = { phase: 'intention', intention: '' };
  let current;
  let ritualRequest;
  let claimFailed = false;
  let aiRequest;

  function writeLocal(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch { return false; }
  }

  function switchPanel(name) {
    if (name !== panel) cancelGesture();
    panel = name;
    for (const button of all('[data-panel]')) button.setAttribute('aria-pressed', String(button.dataset.panel === name));
    for (const view of all('[data-view]')) view.hidden = view.dataset.view !== name;
    if (name === 'saved') renderSaved();
    if (name === 'fortune' && current && !collected && reveal.hidden && dialog.open) {
      openReveal(current.card, revealOrigin ?? frame.getBoundingClientRect());
    }
    updatePreview();
  }

  function appendMessage(log, turn) {
    const entry = document.createElement('div');
    entry.className = 'consultation-message ' + turn.role;
    const label = document.createElement('small');
    label.textContent = turn.role === 'user' ? '我' : turn.mode === 'reference' ? '参考卡 · AI 未配置' : '师父 · AI';
    const content = document.createElement('p');
    content.textContent = turn.content;
    entry.append(label, content);
    if (Array.isArray(turn.sources) && turn.sources.length) {
      const row = document.createElement('div');
      row.className = 'consultation-sources';
      for (const [index, source] of turn.sources.entries()) {
        if (typeof source?.source !== 'string') continue;
        const item = document.createElement(typeof source.url === 'string' && ['https://suttacentral.net/', 'https://www.ctc.org.hk/chim/'].some(origin => source.url.startsWith(origin)) ? 'a' : 'span');
        item.textContent = '〔' + (index + 1) + '〕' + source.source;
        if (item.tagName === 'A') {
          item.href = source.url;
          item.target = '_blank';
          item.rel = 'noopener noreferrer';
        }
        row.append(item);
      }
      entry.append(row);
    }
    log.append(entry);
    const scroll = log.closest('.consultation-scroll');
    if (scroll?.clientHeight) scroll.scrollTop = scroll.scrollHeight;
    return content;
  }

  function renderLog(log, turns, greeting) {
    log.replaceChildren();
    if (greeting && !turns.length) appendMessage(log, { role: 'assistant', content: greeting });
    for (const turn of turns) appendMessage(log, turn);
  }

  function renderChat() {
    renderLog($('[data-chat-log]'), chat, '来坐一会儿。想聊点什么？');
    $('[data-clear-chat]').disabled = !chat.length || Boolean(aiRequest);
  }

  async function ask({ route, turns, question, log, status, extra, complete, render }) {
    if (aiRequest || ritualRequest) return false;
    const controller = new AbortController();
    aiRequest = controller;
    const buttons = all('button[type="submit"], [data-interpret], [data-clear-chat]');
    for (const button of buttons) button.disabled = true;
    const history = turns.slice(-8).map(({ role, content }) => ({ role, content: content.slice(0, 1600) }));
    const user = { role: 'user', content: question };
    appendMessage(log, user);
    const reply = appendMessage(log, { role: 'assistant', content: '师父正在想一想…' });
    let content = '';
    let sources = [];
    status.textContent = '师父正在回应…';
    try {
      const mode = await receive(route, { question, history, ...extra }, controller.signal, event => {
        if (event.type === 'sources') sources = event.items;
        if (event.type === 'text') {
          content += event.text;
          reply.textContent = content;
          const scroll = log.closest('.consultation-scroll');
          if (scroll?.clientHeight) scroll.scrollTop = scroll.scrollHeight;
        }
      });
      turns.push(user, { role: 'assistant', content, mode, sources });
      if (turns.length > 16) turns.splice(0, turns.length - 16);
      complete();
      status.textContent = mode === 'reference' ? '当前显示参考内容。配置 DeepSeek 后可继续 AI 对话。' : '';
      return true;
    } catch (error) {
      if (!controller.signal.aborted) {
        status.textContent = error instanceof ConsultationError ? error.message : '这次回答中断了，可以再试一次。';
      }
      return false;
    } finally {
      if (aiRequest === controller) aiRequest = undefined;
      for (const button of buttons) button.disabled = false;
      render();
    }
  }

  $('[data-chat-form]').addEventListener('submit', async event => {
    event.preventDefault();
    const question = chatInput.value.trim();
    if (!question) return;
    const ok = await ask({
      route: 'chat', turns: chat, question, log: $('[data-chat-log]'), status: $('[data-chat-status]'),
      complete: () => writeLocal(memoryKey, chat), render: renderChat,
    });
    if (ok && chatInput.value.trim() === question) chatInput.value = '';
  });
  $('[data-clear-chat]').addEventListener('click', () => {
    if (aiRequest) return;
    chat = [];
    try { localStorage.removeItem(memoryKey); } catch {}
    $('[data-chat-status]').textContent = '已清除这台浏览器的对话记忆。';
    renderChat();
  });

  function renderRitual() {
    const phase = ritual.phase;
    $('[data-intention]').hidden = phase !== 'intention';
    const summary = $('[data-intention-summary]');
    summary.hidden = !ritual.intention || phase === 'intention';
    summary.textContent = ritual.intention ? '所求 · ' + ritual.intention : '';
    const hint = $('[data-gesture-hint]');
    hint.hidden = !['shake', 'confirmation'].includes(phase);
    hint.textContent = phase === 'shake'
      ? '按住签筒上下摇动，摇满后松手。'
      : '拖起杯筊，松手抛掷。';
    progress.hidden = phase !== 'shake' || pendingAction === 'draw';
    $('[data-claim]').hidden = phase !== 'claim' || !claimFailed;
    $('[data-restart]').hidden = phase === 'intention';
    $('.consultation-card').hidden = phase !== 'complete' || !current || !collected;
    for (const button of all('[data-intention] button, [data-claim], [data-restart]')) {
      button.disabled = Boolean(ritualRequest);
    }
    updatePreview();
  }

  function updatePreview() {
    const phase = ritual.phase;
    const mode = pendingAction === 'draw' ? 'fall' :
      phase === 'claim' ? 'confirmation' : ['shake', 'confirmation'].includes(phase) ? phase : null;
    if (stage.hidden !== !mode) stage.hidden = !mode;
    const active = dialog.open && panel === 'fortune' && reveal.hidden;
    const gripHidden = !active || !['shake', 'confirmation'].includes(phase) || Boolean(ritualRequest || aiRequest);
    if (grip.hidden !== gripHidden) grip.hidden = gripHidden;
    if (mode && grip.dataset.phase !== phase) {
      grip.dataset.phase = phase;
      grip.setAttribute('aria-label', phase === 'shake' ? '竹签筒，上下拖动摇签' : '杯筊，向上拖动后松手抛掷');
    }
    if (active && mode) previewFor().display(mode, stage);
  }

  function previewFor() {
    if (preview) return preview;
    if (!previewFailed) {
      try { preview = makePreview(world.types, seat.props); }
      catch { previewFailed = true; }
    }
    if (!preview) {
      stage.classList.add('preview-unavailable');
      if (!stage.querySelector('.consultation-preview-note')) {
        const note = document.createElement('p');
        note.className = 'consultation-preview-note';
        note.textContent = '器物画面暂不可用，仍可在此拖动。';
        stage.append(note);
      }
    }
    return preview ?? { display() {} };
  }

  function motionFrom(from, to) {
    if (reduced.matches || !from.width || !to.width) return null;
    const dx = from.left + from.width / 2 - to.left - to.width / 2;
    const dy = from.top + from.height / 2 - to.top - to.height / 2;
    return { transform: 'translate(' + dx + 'px,' + dy + 'px) scale(.24)', opacity: 0.65 };
  }

  function openReveal(card, from) {
    collected = false;
    frame.inert = true;
    reveal.hidden = false;
    $('#reveal-number').textContent = '第 ' + String(card.number).padStart(2, '0') + ' 签 · ' + card.grade;
    $('[data-reveal-poem]').textContent = card.poem;
    previewFor().display('reveal', revealProp, card);
    const start = motionFrom(from, revealProp.getBoundingClientRect());
    if (start) flight = revealProp.animate([start, { transform: 'none', opacity: 1 }], {
      duration: 640, easing: 'cubic-bezier(.19,.76,.29,1)',
    });
    $('[data-collect]').focus({ preventScroll: true });
  }

  async function collect() {
    const button = $('[data-collect]');
    if (reveal.hidden || button.disabled) return;
    button.disabled = true;
    flight?.cancel();
    const end = motionFrom(frame.getBoundingClientRect(), revealProp.getBoundingClientRect());
    if (end) {
      flight = revealProp.animate([{ transform: 'none', opacity: 1 }, end], {
        duration: 390, easing: 'cubic-bezier(.45,.03,.79,.38)', fill: 'forwards',
      });
      await flight.finished.catch(() => {});
    }
    flight?.cancel();
    reveal.hidden = true;
    frame.inert = false;
    button.disabled = false;
    collected = true;
    renderRitual();
    if (dialog.open) {
      $('.consultation-scroll:has(.consultation-card)').scrollTop = 0;
      $('[data-interpret]').focus({ preventScroll: true });
    }
  }

  async function act(action, fields = {}, launch) {
    if (ritualRequest || aiRequest || !dialog.open) return;
    const previous = ritual;
    const intention = action === 'start' ? intentionInput.value.trim() : previous.intention;
    const controller = new AbortController();
    ritualRequest = controller;
    pendingAction = action;
    claimFailed = false;
    const origin = stage.hidden ? frame.getBoundingClientRect() : stage.getBoundingClientRect();
    let confirmed = false;
    drawStatus.textContent = { start: '静心片刻，准备摇签。', cast: '筊杯正在落下…', draw: '一支签正在落下…', claim: '正在查找这支签…' }[action];
    const started = performance.now();
    const shakeTime = action === 'draw' ? seat.shake() : 0;
    renderRitual();
    try {
      const response = await post('ritual', { action, id: previous.id, revision: previous.revision, ...(action === 'start' ? { intention } : {}), ...fields }, controller.signal);
      const next = await response.json();
      if (controller.signal.aborted) return;
      let animation = 0;
      if (action === 'cast') animation = seat.cast(next.faces, launch);
      if (action === 'draw') {
        await new Promise(resolve => setTimeout(resolve, Math.max(0, shakeTime - (performance.now() - started))));
        if (controller.signal.aborted) return;
        animation = seat.reveal();
      }
      if (animation) await new Promise(resolve => setTimeout(resolve, animation));
      if (controller.signal.aborted) return;
      ritual = { ...next, intention: next.intention ?? intention };
      if (action === 'start') drawStatus.textContent = '所求已记下，可以上下拖动签筒。';
      if (action === 'cast') {
        if (next.result === 'yes') {
          confirmed = true;
          revealOrigin = origin;
          drawStatus.textContent = '圣杯 · 一平一凸。第 ' + next.number + ' 签已确认。';
        } else {
          seat.resetSlip();
          progress.value = 0;
          drawStatus.textContent = next.result === 'laugh'
            ? '笑杯 · 两平面朝上。请重新摇签。'
            : '阴杯 · 两凸面朝上。请重新摇签。';
        }
      }
      if (action === 'draw') drawStatus.textContent = '落下的是第 ' + next.number + ' 签。';
      if (action === 'claim') {
        current = { card: next.card, intention: ritual.intention, turns: [] };
        renderCard();
        drawStatus.textContent = '';
        collected = false;
        if (panel === 'fortune') openReveal(next.card, revealOrigin ?? origin);
      }
    } catch (error) {
      if (!controller.signal.aborted) {
        drawStatus.textContent = error instanceof ConsultationError ? error.message : '暂时无法继续求签，请稍后重试。';
        claimFailed = action === 'claim';
      }
    } finally {
      if (ritualRequest === controller) ritualRequest = undefined;
      pendingAction = undefined;
      if (action === 'cast') seat.releaseCups();
      renderRitual();
    }
    if (confirmed && dialog.open) void act('claim', { number: ritual.number });
  }

  function resetRitual() {
    if (ritualRequest || aiRequest) return;
    ritual = { phase: 'intention', intention: '' };
    current = undefined;
    collected = true;
    revealOrigin = undefined;
    drawStatus.textContent = '';
    intentionInput.value = '';
    followup.value = '';
    progress.value = 0;
    seat.resetRitual();
    renderRitual();
    intentionInput.focus({ preventScroll: true });
  }

  $('[data-intention]').addEventListener('submit', event => {
    event.preventDefault();
    if (intentionInput.value.trim()) void act('start');
  });
  $('[data-claim]').addEventListener('click', () => act('claim', { number: ritual.number }));
  $('[data-collect]').addEventListener('click', collect);
  $('[data-restart]').addEventListener('click', resetRitual);

  let pointer;
  let keyboard;
  const phaseForGesture = () => dialog.open && panel === 'fortune' && !ritualRequest && !aiRequest &&
    ['shake', 'confirmation'].includes(ritual.phase) ? ritual.phase : null;

  function cancelGesture() {
    const id = pointer?.id;
    pointer = undefined;
    keyboard = undefined;
    if (id !== undefined && grip.hasPointerCapture(id)) grip.releasePointerCapture(id);
    seat.settle();
    if (!ritualRequest) seat.releaseCups();
    if (!ritualRequest && ritual.phase === 'shake') progress.value = 0;
  }

  function moveGesture(gesture, x, y) {
    const dy = y - gesture.y;
    const direction = Math.sign(dy);
    if (Math.abs(dy) >= 2) {
      if (gesture.direction && gesture.direction !== direction) gesture.reversals++;
      gesture.direction = direction;
      gesture.distance += Math.abs(dy);
      gesture.y = y;
    }
    if (gesture.phase === 'shake') {
      progress.value = Math.min(100, gesture.distance / 1.15);
      seat.sway((y - gesture.startY) / 110, dy / 30);
    } else {
      gesture.lift = Math.max(0, gesture.startY - y);
      gesture.dx = x - gesture.startX;
      seat.liftCups(gesture.dx, gesture.lift);
    }
  }

  function beginGesture(phase, x, y) {
    seat.enableSound();
    if (phase === 'shake') progress.value = 0;
    return { phase, startX: x, startY: y, y, dx: 0, lift: 0, direction: 0, reversals: 0, distance: 0 };
  }

  function finishGesture(gesture) {
    if (gesture.phase === 'shake' && gesture.distance >= 115 && gesture.reversals > 0) void act('draw');
    else if (gesture.phase === 'confirmation' && gesture.lift >= 24) void act('cast', {}, gesture);
    else {
      cancelGesture();
      drawStatus.textContent = gesture.phase === 'shake'
        ? '再试一次，上下往返摇到进度满。'
        : '把杯筊往上拖起一点，再松手抛掷。';
    }
  }

  grip.addEventListener('pointerdown', event => {
    const phase = phaseForGesture();
    if (event.button !== 0 || !phase || pointer || keyboard) return;
    event.preventDefault();
    pointer = { ...beginGesture(phase, event.clientX, event.clientY), id: event.pointerId };
    grip.setPointerCapture(event.pointerId);
  });
  grip.addEventListener('pointermove', event => {
    if (pointer?.id === event.pointerId) moveGesture(pointer, event.clientX, event.clientY);
  });
  grip.addEventListener('pointerup', event => {
    if (pointer?.id !== event.pointerId) return;
    const gesture = pointer;
    pointer = undefined;
    seat.enableSound();
    finishGesture(gesture);
  });
  for (const type of ['pointercancel', 'lostpointercapture']) {
    grip.addEventListener(type, event => { if (pointer?.id === event.pointerId) cancelGesture(); });
  }
  grip.addEventListener('keydown', event => {
    const phase = phaseForGesture();
    if (event.repeat || !phase || !['ArrowUp', 'ArrowDown'].includes(event.key)) return;
    event.preventDefault();
    keyboard ??= beginGesture(phase, 0, 0);
    const y = phase === 'confirmation' ? -36 : event.key === 'ArrowUp' ? -38 : 38;
    moveGesture(keyboard, 0, y);
    if (phase === 'shake' && keyboard.distance >= 115 && keyboard.reversals) {
      const gesture = keyboard;
      keyboard = undefined;
      finishGesture(gesture);
    }
  });
  grip.addEventListener('keyup', event => {
    if (keyboard?.phase !== 'confirmation' || event.key !== 'ArrowUp') return;
    const gesture = keyboard;
    keyboard = undefined;
    finishGesture(gesture);
  });

  function renderCard() {
    const { card, turns, key, interpretation } = current;
    $('[data-reading-form]').hidden = !turns.length && !interpretation;
    $('[data-number]').textContent = '第 ' + String(card.number).padStart(2, '0') + ' 签';
    $('[data-grade]').textContent = card.grade;
    $('[data-title]').textContent = card.edition === 'guanyin-ctc' ? '典故 · ' + card.title : card.title;
    const source = $('[data-source]');
    source.hidden = !(typeof card.sourceUrl === 'string' && card.sourceUrl.startsWith('https://www.ctc.org.hk/chim/'));
    if (!source.hidden) source.href = card.sourceUrl;
    else source.removeAttribute('href');
    $('.consultation-poem').textContent = card.poem;
    $('[data-meaning]').textContent = card.edition === 'guanyin-ctc' ? '解曰\n' + card.meaning : card.meaning;
    $('[data-interpret]').hidden = turns.length > 0;
    $('[data-save]').textContent = key ? '已存入签匣' : '存入签匣';
    $('[data-save]').disabled = Boolean(key);
    $('.consultation-reading').hidden = !turns.length && !interpretation;
    renderLog($('[data-reading-log]'), turns);
    if (!turns.length && interpretation) appendMessage($('[data-reading-log]'), { role: 'assistant', content: interpretation });
  }

  async function interpret(question) {
    if (!current || aiRequest || ritualRequest) return;
    const item = current;
    $('.consultation-reading').hidden = false;
    seat.greet();
    const ok = await ask({
      route: 'reading', turns: item.turns, question, log: $('[data-reading-log]'), status: drawStatus,
      extra: { number: item.card.number, edition: item.card.edition || 'original', intention: item.intention || '' }, render: renderCard,
      complete() {
        if (!item.key) return;
        const stored = getSaved();
        const saved = stored.find(entry => entry.key === item.key);
        if (saved) { saved.turns = item.turns; writeLocal(storageKey, stored); }
      },
    });
    if (ok) {
      if (followup.value.trim() === question) followup.value = '';
      $('.consultation-reading').scrollIntoView({ block: 'nearest' });
    }
  }

  $('[data-interpret]').addEventListener('click', () => interpret('请结合我所求的事，解读这一支签。'));
  $('[data-reading-form]').addEventListener('submit', event => {
    event.preventDefault();
    if (followup.value.trim()) void interpret(followup.value.trim());
  });
  $('[data-save]').addEventListener('click', () => {
    if (!current || current.key) return;
    const key = [...crypto.getRandomValues(new Uint32Array(4))].map(value => value.toString(16)).join('-');
    const entry = { ...current, key, savedAt: Date.now() };
    const stored = [entry, ...getSaved()];
    if (!writeLocal(storageKey, stored)) {
      drawStatus.textContent = '浏览器暂时无法保存这支签。';
      return;
    }
    current.key = key;
    renderCard();
    drawStatus.textContent = '这支签已存入签匣。';
  });

  function renderSaved() {
    const list = $('.consultation-saved');
    list.replaceChildren();
    for (const item of getSaved()) {
      const button = document.createElement('button');
      button.type = 'button';
      const title = document.createElement('strong');
      title.textContent = item.card.title;
      const detail = document.createElement('small');
      detail.textContent = '第 ' + item.card.number + ' 签 · ' + item.card.grade;
      button.append(title, detail);
      button.addEventListener('click', () => {
        if (aiRequest || ritualRequest) return;
        current = { ...item, turns: Array.isArray(item.turns) ? item.turns.filter(validTurn).slice(-16) : [] };
        ritual = { phase: 'complete', intention: current.intention || '' };
            seat.resetRitual();
        followup.value = '';
        drawStatus.textContent = '已打开签匣中的签文。';
        renderCard();
        renderRitual();
        switchPanel('fortune');
      });
      list.append(button);
    }
    if (!list.children.length) list.textContent = '签匣还是空的。抽到想留存的签，可以放进这里。';
  }

  for (const button of all('[data-panel]')) button.addEventListener('click', () => switchPanel(button.dataset.panel));
  dialog.addEventListener('keydown', event => {
    event.stopPropagation();
    if (event.key === 'Escape' && !reveal.hidden) {
      event.preventDefault();
      void collect();
    }
  });
  $('[data-close]').addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => {
    flight?.cancel();
    frame.inert = false;
    reveal.hidden = true;
    collected = true;
    if (ritual.phase === 'claim') claimFailed = true;
    aiRequest?.abort();
    ritualRequest?.abort();
    cancelGesture();
    hide();
    if (canvas.isConnected) canvas.focus({ preventScroll: true });
  });

  const resize = () => dialog.style.setProperty('--consultation-height', (visualViewport?.height || innerHeight) + 'px');
  visualViewport?.addEventListener('resize', resize, { signal: world.signal });
  resize();
  renderChat();
  renderRitual();

  return {
    tick(time) {
      if (!dialog.open) return;
      updatePreview();
      if (preview && (!reveal.hidden || (panel === 'fortune' && !stage.hidden))) preview.render(time);
    },
    open(name) {
      if (!dialog.open) {
        if (document.querySelector('dialog[open]') || !seat.near()) return;
        world.stopWalking();
        show();
        switchPanel(name);
        dialog.showModal();
        if (name === 'fortune' && current && !collected) openReveal(current.card, frame.getBoundingClientRect());
      } else switchPanel(name);
      if (name === 'chat') {
        seat.greet();
        if (matchMedia('(pointer: fine)').matches) chatInput.focus({ preventScroll: true });
      }
    },
    dispose() {
      aiRequest?.abort();
      ritualRequest?.abort();
      if (dialog.open) hide();
      preview?.dispose();
      dialog.remove();
    },
  };
}

export function mountConsultation(world) {
  const { host, player, camera, canvas, signal, types } = world;
  const game = host.closest('.sansa-game');
  const seat = makeSeat(world);
  const marker = document.createElement('button');
  marker.type = 'button';
  marker.className = 'consultation-locator';
  marker.innerHTML = icon + '<span>问心席</span>';
  marker.setAttribute('aria-label', '前往问心席');
  game.append(marker);
  const projection = new types.Vector();
  const anchors = ['chat', 'fortune'].map(name => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'consultation-anchor';
    button.hidden = true;
    button.textContent = name === 'chat' ? '与师父聊聊' : '摇签筒';
    game.append(button);
    return { name, button };
  });

  let walking = false;
  let panel;
  const mobile = matchMedia('(max-width: 700px)');
  const Vector = types.Vector;
  let focused = false;
  let lens = 0;
  let lastLensTime = 0;
  let lensAspect;
  let lensMobile;
  function updateLens(time) {
    const dt = lastLensTime ? Math.min(0.08, (time - lastLensTime) / 1000) : 0;
    lastLensTime = time;
    const target = focused ? 1 : 0;
    const next = matchMedia('(prefers-reduced-motion: reduce)').matches
      ? target : lens + (target - lens) * (1 - Math.exp(-7 * dt));
    const shift = Math.abs(next - target) < 0.002 ? target : next;
    if (shift === lens && lensAspect === camera.aspect && lensMobile === mobile.matches) return;
    lens = shift;
    lensAspect = camera.aspect;
    lensMobile = mobile.matches;
    camera.zoom = 1 - (mobile.matches ? 0.08 : 0.21) * lens;
    if (!lens) {
      if (camera.view?.enabled) camera.clearViewOffset();
      return;
    }
    const width = 1000 * camera.aspect;
    camera.setViewOffset(width, 1000, mobile.matches ? 0 : width * 0.285 * lens,
      mobile.matches ? 298 * lens : 0, width, 1000);
  }
  function enter(name) {
    panel ??= createPanel({
      canvas, world, seat,
      show() { focused = true; world.wake(); },
      hide() { focused = false; world.wake(); },
    });
    panel.open(name);
  }
  for (const { name, button } of anchors) button.addEventListener('click', () => enter(name));
  marker.addEventListener('click', () => {
    if (seat.near()) enter('chat');
    else if (!document.querySelector('dialog[open]')) {
      walking = true;
      world.walkTo(approach);
    }
  });

  let nearBefore = false;
  let last = 0;
  return {
    tick(time) {
      seat.tick(time);
      updateLens(time);
      panel?.tick(time);
      if (time - last < 34) return;
      last = time;
      const near = seat.near();
      if (walking && !world.travelling()) {
        if (near) world.face(approach.x, 19.3);
        walking = false;
      }
      if (near !== nearBefore) {
        nearBefore = near;
        marker.classList.toggle('is-near', near);
        marker.setAttribute('aria-label', near ? '打开问心席' : '前往问心席');
      }
      if (!near || game.classList.contains('is-beading')) {
        marker.hidden = false;
        for (const { button } of anchors) button.hidden = true;
        return;
      }
      const bounds = canvas.getBoundingClientRect();
      for (const { button, name } of anchors) {
        const target = name === 'chat' ? seat.monk : seat.shaker;
        target.getWorldPosition(projection);
        projection.y += name === 'chat' ? 1.74 : 0.76;
        projection.project(camera);
        const x = bounds.left + (projection.x + 1) * bounds.width / 2;
        const y = bounds.top + (1 - projection.y) * bounds.height / 2;
        button.hidden = projection.z < -1 || projection.z > 1 || x < 45 ||
          x > innerWidth - 45 || y < 90 || y > innerHeight - 95;
        if (!button.hidden) button.style.transform = 'translate(' + Math.round(x) + 'px,' + Math.round(y) + 'px) translate(-50%, -50%)';
      }
      marker.hidden = !anchors[0].button.hidden;
    },
    cameraFrame() {
      if (!focused) return null;
      const p = player.position;
      const rear = new Vector(-0.50, 0, 0.866);
      const position = p.clone().addScaledVector(rear, mobile.matches ? 4.05 : 5.45);
      position.y += mobile.matches ? 2.1 : 2.18;
      const look = new Vector(station.x, seat.root.position.y + 1.02, station.z);
      look.x = look.x * 0.77 + p.x * 0.23 - (mobile.matches ? 0 : 1.65);
      look.z = look.z * 0.77 + p.z * 0.23;
      return { position, look };
    },
    pick(ray, obstruction) {
      if (!seat.near()) return false;
      const hit = ray.intersectObjects([seat.monk, seat.shaker], true)[0];
      if (!hit || hit.distance > obstruction + 0.04) return false;
      for (let mesh = hit.object; mesh !== seat.root; mesh = mesh.parent) {
        if (mesh === seat.shaker || mesh === seat.monk) {
          enter(mesh === seat.shaker ? 'fortune' : 'chat');
          return true;
        }
      }
      return false;
    },
    blocks: seat.blocks,
    dispose() {
      panel?.dispose();
      marker.remove();
      for (const { button } of anchors) button.remove();
      seat.dispose();
    },
  };
}
