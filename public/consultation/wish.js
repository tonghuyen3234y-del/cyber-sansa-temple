import { makePlaquePainter, makeFloatingPlaque } from './wish-card.js';
import { makeWishTree, approach, tree as treeAt } from './wish-tree.js';
import {
  clampText, detectThemes, fallbackCard, nameMax, titleFor, themes, wishMax,
} from './text.js';

const storageKey = 'sansa:wish:v1';
const icon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 21v-6M12 15 8.8 11h6.4L12 15M8.4 21h7.2M4.2 8.4c1.5-.5 2.6-1.4 3.2-2.7.6 1.3 1.7 2.2 3.2 2.7M14 6.6c1-.3 1.7-.9 2.1-1.8.4.9 1.1 1.5 2.1 1.8"/></svg>';

const today = () => new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' });
const draftKey = () => 'sansa:wish:draft:v1';

function read() {
  try {
    const data = JSON.parse(localStorage.getItem(storageKey) || 'null');
    if (!data || typeof data !== 'object' || !Array.isArray(data.history)) return { current: null, history: [] };
    return data;
  } catch { return { current: null, history: [] }; }
}

function write(value) {
  try { localStorage.setItem(storageKey, JSON.stringify(value)); return true; } catch { return false; }
}

function newKey() {
  return [...crypto.getRandomValues(new Uint32Array(4))].map(value => value.toString(16)).join('-');
}

class WishError extends Error {}

async function request(wish, name, signal) {
  const response = await fetch('/api/consultation/wish', {
    method: 'POST', signal,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ wish, name }),
  });
  if (response.ok) return response.json();
  const error = await response.json().catch(() => null);
  throw new WishError(error?.error || '树下暂时没有回应，请稍后再试。');
}

function createPanel({ tree, types, canvas, onFind, signal }) {
  const dialog = document.createElement('dialog');
  dialog.className = 'game-dialog wish-dialog';
  dialog.setAttribute('aria-labelledby', 'wish-title');
  dialog.innerHTML = `
    <div class="wish-frame">
      <header class="wish-header">
        <div><p class="wish-eyebrow">清缘堂 · 莲池远岸</p><h2 id="wish-title">许愿树</h2></div>
        <button type="button" class="dialog-close tool" data-close aria-label="离开许愿树"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg></button>
      </header>
      <nav class="wish-tabs" aria-label="许愿树">
        <button type="button" data-panel="wish">许下心愿</button>
        <button type="button" data-panel="placards">我的心愿</button>
      </nav>
      <section data-view="wish" class="wish-view">
        <div class="wish-scroll">
          <form data-wish-form novalidate>
            <label class="wish-label" for="wish-text">此刻，想把什么话挂到树上？</label>
            <p class="wish-hint">不必讲究句子，写下来就好。</p>
            <textarea id="wish-text" maxlength="${wishMax}" rows="4" placeholder="例如：希望奶奶这个冬天过得安稳一些。"></textarea>
            <div class="wish-meta">
              <label for="wish-name">落款<small>可选</small></label>
              <input id="wish-name" type="text" maxlength="${nameMax}" autocomplete="off" placeholder="不署也无妨">
              <span class="wish-count" data-count>0 / ${wishMax}</span>
            </div>
            <p class="wish-error" data-error role="alert"></p>
            <div class="wish-actions">
              <button class="solid-button" type="submit" data-hang>挂上心愿</button>
              <button type="button" class="wish-text-button" data-back hidden>看看我的心愿</button>
            </div>
          </form>
          <div class="wish-ritual" data-ritual hidden>
            <div class="wish-ritual-plaque" data-plaque><span class="sansa-sr">木牌</span></div>
            <p class="wish-ritual-note" data-ritual-note>木牌正在落笔…</p>
          </div>
        </div>
      </section>
      <section data-view="placards" class="wish-view" hidden>
        <div class="wish-scroll">
          <p class="wish-note">这里收着你挂上过的每一块木牌，只保存在这台设备上。</p>
          <div class="wish-placards" data-placards></div>
        </div>
      </section>
    </div>
    <div class="wish-card-layer" data-layer hidden>
      <article class="wish-card" role="dialog" aria-modal="true" aria-labelledby="wish-card-verse">
        <p class="wish-eyebrow">寄托卡片</p>
        <div class="wish-card-prop" data-card-prop></div>
        <p class="wish-card-verse" id="wish-card-verse" data-card-verse></p>
        <div class="wish-card-lines" data-card-lines></div>
        <p class="wish-card-ref" data-card-ref hidden></p>
        <div class="wish-card-actions">
          <button type="button" class="solid-button" data-find>找到我的木牌</button>
          <button type="button" data-save-card>保存卡片</button>
          <button type="button" class="wish-text-button" data-close-card>收好</button>
        </div>
        <p class="wish-card-status" data-card-status role="status"></p>
      </article>
    </div>
  `;
  document.body.append(dialog);

  const $ = selector => dialog.querySelector(selector);
  const all = selector => [...dialog.querySelectorAll(selector)];
  const textarea = $('#wish-text');
  const nameInput = $('#wish-name');
  const counter = $('[data-count]');
  const errorBox = $('[data-error]');
  const form = $('[data-wish-form]');
  const frame = $('.wish-frame');
  const layer = $('[data-layer]');
  const ritual = $('[data-ritual]');
  const ritualPlaque = $('[data-plaque]');
  const ritualNote = $('[data-ritual-note]');
  const cardProp = $('[data-card-prop]');
  const cardLinesBox = $('[data-card-lines]');
  const cardStatus = $('[data-card-status]');
  const paint = makePlaquePainter(types);
  const floating = makeFloatingPlaque(types, paint);
  let panel = 'wish';
  let busy = false;
  let controller;
  let latest;
  let frameId = 0;
  let ritualFrame = 0;

  function switchPanel(next) {
    panel = next;
    for (const button of all('[data-panel]')) button.setAttribute('aria-pressed', String(button.dataset.panel === next));
    for (const view of all('[data-view]')) view.hidden = view.dataset.view !== next;
    if (next === 'placards') renderPlacards();
    else if (!busy && matchMedia('(pointer: fine)').matches) textarea.focus({ preventScroll: true });
  }

  function updateCount() {
    const length = [...textarea.value].length;
    counter.textContent = length + ' / ' + wishMax;
    counter.classList.toggle('is-full', length >= wishMax);
  }
  textarea.addEventListener('input', () => {
    updateCount();
    errorBox.textContent = '';
    try { sessionStorage.setItem(draftKey(), textarea.value); } catch {}
  });
  try {
    const draft = sessionStorage.getItem(draftKey());
    if (draft) textarea.value = draft;
  } catch {}
  updateCount();

  function playRitual(entry) {
    form.hidden = true;
    ritual.hidden = false;
    ritualNote.textContent = '木牌正在落笔…';
    floating.paint(entry, 0);
    ritualFrame = 0;
    const started = performance.now();
    cancelAnimationFrame(frameId);
    const step = now => {
      if (ritual.hidden) return;
      floating.repaint(Math.min(1, (now - started) / 1500));
      floating.render(ritualPlaque, now);
      ritualFrame = requestAnimationFrame(step);
    };
    ritualFrame = requestAnimationFrame(step);
    return {
      written() { ritualNote.textContent = '挂上树枝…'; },
      finish() {
        ritual.hidden = true;
        form.hidden = false;
        cancelAnimationFrame(ritualFrame);
      },
    };
  }

  function renderCardLines(text) {
    cardLinesBox.replaceChildren();
    for (const [index, line] of String(text).split('\n').entries()) {
      const item = document.createElement('p');
      item.textContent = line;
      item.style.animationDelay = index * 190 + 'ms';
      cardLinesBox.append(item);
    }
  }

  function openCard(card, meta) {
    latest = { card, meta };
    frame.inert = true;
    layer.hidden = false;
    $('[data-card-verse]').textContent = card.verse || '一念起处';
    renderCardLines(card.lines);
    const ref = $('[data-card-ref]');
    ref.hidden = card.mode !== 'reference';
    ref.textContent = card.mode === 'reference'
      ? '这是树下按你的心愿整理的静语，非 AI 生成。启用 DeepSeek 后，会另写一张只属于这句话的卡片。'
      : '';
    cardStatus.textContent = '';
    const save = $('[data-save-card]');
    save.hidden = !meta?.key;
    save.disabled = Boolean(meta?.saved);
    save.textContent = meta?.saved ? '已存为文字卡' : '保存卡片';
    $('[data-find]').hidden = !meta?.key;
    floating.paint({
      title: meta?.title || titleFor(meta?.wish || card.wish || ''),
      wish: meta?.wish || card.wish || '',
      name: meta?.name || '',
      date: meta?.date || today(),
    }, 1);
    const draw = now => {
      if (layer.hidden) return;
      floating.render(cardProp, now);
      frameId = requestAnimationFrame(draw);
    };
    cancelAnimationFrame(frameId);
    frameId = requestAnimationFrame(draw);
    (save.hidden ? $('[data-find]') : save).focus({ preventScroll: true });
  }

  function closeCard() {
    layer.hidden = true;
    frame.inert = false;
    cancelAnimationFrame(frameId);
  }

  function saveCardText() {
    const meta = latest?.meta;
    if (!meta?.key) return;
    const data = read();
    const entry = data.history.find(item => item.key === meta.key);
    if (!entry) return;
    entry.card = { verse: latest.card.verse, lines: latest.card.lines, mode: latest.card.mode, at: Date.now() };
    if (!write(data)) {
      cardStatus.textContent = '浏览器暂时无法保存这张卡片。';
      return;
    }
    meta.saved = true;
    const save = $('[data-save-card]');
    save.disabled = true;
    save.textContent = '已存为文字卡';
    cardStatus.textContent = '卡片已收进「我的心愿」，可随时重读。';
  }

  function commit(entry, card) {
    const data = read();
    const existing = data.history.find(item => item.key === entry.key);
    if (!existing) data.history = [entry, ...data.history].slice(0, 12);
    if (card) {
      const target = data.history.find(item => item.key === entry.key);
      if (target) target.card = { verse: card.verse, lines: card.lines, mode: card.mode, at: Date.now() };
    }
    data.current = entry.key;
    write(data);
    try { sessionStorage.removeItem(draftKey()); } catch {}
    textarea.value = '';
    nameInput.value = '';
    updateCount();
  }

  async function submit() {
    if (busy) return;
    const wish = clampText(textarea.value, wishMax);
    if ([...wish].length < 2) {
      errorBox.textContent = '再多写几个字，让树知道你挂的是什么。';
      textarea.focus({ preventScroll: true });
      return;
    }
    const name = clampText(nameInput.value, nameMax);
    const entry = {
      key: newKey(), wish, name, title: titleFor(wish), date: today(), at: Date.now(), topics: detectThemes(wish),
    };
    busy = true;
    controller = new AbortController();
    errorBox.textContent = '';
    for (const button of all('form button, [data-panel]')) button.disabled = true;
    const stage = playRitual(entry);
    tree.enableSound();
    const hanging = tree.hang(entry);
    try {
      const card = await request(wish, name, controller.signal);
      if (controller.signal.aborted) return;
      commit(entry, card);
      stage.written();
      await hanging;
      if (controller.signal.aborted) return;
      stage.finish();
      tree.bringIntoView(entry.key);
      openCard(card, { ...entry, saved: false });
    } catch (error) {
      if (controller.signal.aborted) return;
      // 接口失败也让这块牌挂得住，回一张本地静语卡。
      const card = error instanceof WishError ? null : fallbackCard(wish, entry.topics);
      stage.written();
      commit(entry, card);
      await hanging.catch(() => {});
      stage.finish();
      tree.bringIntoView(entry.key);
      if (card) openCard(card, { ...entry, saved: false });
      else errorBox.textContent = error.message;
    } finally {
      busy = false;
      controller = undefined;
      for (const button of all('form button, [data-panel]')) button.disabled = false;
      updateCount();
    }
  }

  form.addEventListener('submit', event => {
    event.preventDefault();
    void submit();
  });

  function placardItem(entry) {
    const item = document.createElement('article');
    item.className = 'wish-placard';
    if (entry.key === read().current) item.classList.add('is-current');
    const head = document.createElement('div');
    head.className = 'wish-placard-head';
    const title = document.createElement('strong');
    title.textContent = entry.title || titleFor(entry.wish || '');
    const meta = document.createElement('small');
    meta.textContent = (themes[entry.topics?.[0]]?.label || '祝愿') + ' · ' + (entry.date || '');
    head.append(title, meta);
    item.append(head);

    if (entry.card) {
      const card = document.createElement('div');
      card.className = 'wish-placard-card';
      const verse = document.createElement('p');
      verse.className = 'wish-card-verse';
      verse.textContent = entry.card.verse;
      card.append(verse);
      for (const line of String(entry.card.lines).split('\n')) {
        const paragraph = document.createElement('p');
        paragraph.textContent = line;
        card.append(paragraph);
      }
      item.append(card);
    }

    const detail = document.createElement('details');
    detail.className = 'wish-placard-detail';
    const summary = document.createElement('summary');
    summary.textContent = '心愿原话与落款';
    detail.append(summary);
    const body = document.createElement('p');
    body.className = 'wish-placard-text';
    body.textContent = entry.wish;
    detail.append(body);
    if (entry.name) {
      const sign = document.createElement('p');
      sign.className = 'wish-note';
      sign.textContent = '落款 · ' + entry.name;
      detail.append(sign);
    }
    item.append(detail);

    const actions = document.createElement('div');
    actions.className = 'wish-placard-actions';
    if (entry.card) {
      const open = document.createElement('button');
      open.type = 'button';
      open.textContent = '重读卡片';
      open.addEventListener('click', () => openCard(
        { verse: entry.card.verse, lines: entry.card.lines, mode: entry.card.mode }, { ...entry, saved: true }));
      actions.append(open);
    } else {
      const reread = document.createElement('button');
      reread.type = 'button';
      reread.textContent = '请树回一张卡片';
      reread.addEventListener('click', () => void rereadCard(entry, reread));
      actions.append(reread);
    }
    const find = document.createElement('button');
    find.type = 'button';
    find.textContent = '在树上找到';
    find.addEventListener('click', () => {
      const data = read();
      data.current = entry.key;
      write(data);
      closeCard();
      dialog.close();
      onFind?.(entry);
    });
    actions.append(find);
    item.append(actions);
    return item;
  }

  async function rereadCard(entry, button) {
    if (busy) return;
    busy = true;
    controller = new AbortController();
    button.disabled = true;
    const original = button.textContent;
    button.textContent = '正在想…';
    try {
      const card = await request(entry.wish, entry.name || '', controller.signal);
      if (controller.signal.aborted) return;
      commit(entry, card);
      openCard(card, { ...entry, saved: true });
      renderPlacards();
    } catch (error) {
      if (controller.signal.aborted) return;
      button.textContent = error instanceof WishError ? error.message : '暂时没有回应，请稍后再试。';
      return;
    } finally {
      busy = false;
      controller = undefined;
      button.disabled = false;
      if (button.textContent === '正在想…') button.textContent = original;
    }
  }

  function renderPlacards() {
    const box = $('[data-placards]');
    const data = read();
    box.replaceChildren();
    for (const entry of data.history) box.append(placardItem(entry));
    if (!data.history.length) {
      const empty = document.createElement('p');
      empty.className = 'wish-empty';
      empty.textContent = '还没有挂过心愿。写下第一句，枝头就多一块木牌。';
      box.append(empty);
    }
    $('[data-back]').hidden = !data.history.length;
  }

  $('[data-back]').addEventListener('click', () => switchPanel('placards'));
  $('[data-find]').addEventListener('click', () => {
    const key = latest?.meta?.key;
    closeCard();
    if (!key) return;
    const data = read();
    data.current = key;
    write(data);
    dialog.close();
    onFind?.({ key });
  });
  $('[data-save-card]').addEventListener('click', saveCardText);
  $('[data-close-card]').addEventListener('click', closeCard);
  layer.addEventListener('pointerdown', event => {
    if (event.target === layer) closeCard();
  });
  dialog.addEventListener('keydown', event => {
    event.stopPropagation();
    if (event.key === 'Escape' && !layer.hidden) {
      event.preventDefault();
      closeCard();
    }
  });
  for (const button of all('[data-panel]')) button.addEventListener('click', () => switchPanel(button.dataset.panel));
  $('[data-close]').addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => {
    controller?.abort();
    cancelAnimationFrame(ritualFrame);
    ritual.hidden = true;
    form.hidden = false;
    busy = false;
    closeCard();
    if (canvas?.isConnected) canvas.focus({ preventScroll: true });
  });

  const resize = () => dialog.style.setProperty('--wish-height', (visualViewport?.height || innerHeight) + 'px');
  visualViewport?.addEventListener('resize', resize, { signal });
  resize();

  return {
    open(name) {
      if (dialog.open) return;
      renderPlacards();
      dialog.showModal();
      switchPanel(name ?? 'wish');
    },
    tick(time) {
      if (!layer.hidden) floating.render(cardProp, time);
    },
    dispose() {
      controller?.abort();
      cancelAnimationFrame(ritualFrame);
      cancelAnimationFrame(frameId);
      floating.dispose();
      dialog.remove();
    },
  };
}

export function mountWishTree(world) {
  const { scene, player, camera, canvas, types, host } = world;
  const game = host.closest('.sansa-game');
  const tree = makeWishTree({ scene, player, height: world.height, types });
  tree.restore(read().history);
  world.refreshShadows();

  const marker = document.createElement('button');
  marker.type = 'button';
  marker.className = 'wish-locator';
  marker.innerHTML = icon + '<span>许愿树</span>';
  marker.setAttribute('aria-label', '前往许愿树');
  game.append(marker);

  const anchor = document.createElement('button');
  anchor.type = 'button';
  anchor.className = 'wish-anchor';
  anchor.hidden = true;
  anchor.textContent = '许下心愿';
  game.append(anchor);

  let panel;
  let walking = false;
  let selectedPlaque;
  let frameTree = false;
  const focusOrigin = new types.Vector();
  const plaqueTarget = new types.Vector();
  const projection = new types.Vector();
  const look = new types.Vector();

  function clearTreeFrame() {
    selectedPlaque = undefined;
    frameTree = false;
  }
  canvas.addEventListener('pointermove', event => {
    if (event.buttons && Math.abs(event.movementX) + Math.abs(event.movementY) > 2) clearTreeFrame();
  }, { signal: world.signal });
  canvas.addEventListener('wheel', clearTreeFrame, { signal: world.signal, passive: true });

  function enter() {
    selectedPlaque = undefined;
    panel ??= createPanel({
      tree, types, canvas, signal: world.signal,
      onFind(entry) {
        selectedPlaque = tree.bringIntoView(entry.key);
        focusOrigin.copy(player.position);
        world.wake();
      },
    });
    world.stopWalking();
    panel.open();
  }

  anchor.addEventListener('click', () => { if (tree.near()) enter(); });
  marker.addEventListener('click', () => {
    if (tree.near()) enter();
    else if (!document.querySelector('dialog[open]')) {
      clearTreeFrame();
      walking = true;
      world.walkTo(approach);
    }
  });

  let nearBefore = false;
  let last = 0;
  return {
    tick(time) {
      tree.tick(time);
      if ((selectedPlaque || frameTree) && player.position.distanceToSquared(focusOrigin) > 0.12) clearTreeFrame();
      panel?.tick(time);
      if (time - last < 34) return;
      last = time;
      const near = tree.near();
      if (walking) {
        if (!world.travelling()) {
          walking = false;
          if (near) {
            world.face(treeAt.x, treeAt.z);
            focusOrigin.copy(player.position);
            frameTree = true;
          }
        }
      }
      if (near !== nearBefore) {
        nearBefore = near;
        marker.classList.toggle('is-near', near);
        marker.setAttribute('aria-label', near ? '许下心愿' : '前往许愿树');
        marker.querySelector('span').textContent = near ? '许下心愿' : '许愿树';
      }
      if (!near || selectedPlaque || game.classList.contains('is-beading') || document.querySelector('.wish-dialog[open]')) {
        marker.hidden = false;
        anchor.hidden = true;
        return;
      }
      const bounds = canvas.getBoundingClientRect();
      tree.focusPoint(look);
      look.y += 0.3;
      projection.copy(look).project(camera);
      const x = bounds.left + (projection.x + 1) * bounds.width / 2;
      const y = bounds.top + (1 - projection.y) * bounds.height / 2;
      anchor.hidden = projection.z < -1 || projection.z > 1 || x < 45 || x > innerWidth - 45 ||
        y < 90 || y > innerHeight - 95;
      if (!anchor.hidden) {
        anchor.style.transform = 'translate(' + Math.round(x) + 'px,' + Math.round(y) + 'px) translate(-50%,-50%)';
      }
      marker.hidden = !anchor.hidden;
    },
    cameraFrame() {
      if (!selectedPlaque && !frameTree) return null;
      const mobile = innerWidth <= 700;
      if (!selectedPlaque) {
        const y = tree.root.position.y;
        return {
          position: new types.Vector(treeAt.x + (mobile ? 15 : 10.7), y + 4.35, treeAt.z - (mobile ? 8.4 : 5.9)),
          look: new types.Vector(treeAt.x, y + 6.1, treeAt.z),
        };
      }
      const position = new types.Vector(
        treeAt.x + (mobile ? 5.7 : 6.6), 0, treeAt.z - (mobile ? 4.0 : 4.9));
      position.y = tree.root.position.y + (mobile ? 2.5 : 2.75);
      const target = selectedPlaque.getWorldPosition(plaqueTarget);
      return { position, look: target };
    },
    pick(ray, obstruction) {
      if (!tree.near()) return false;
      const hit = ray.intersectObjects(tree.pickables, false)[0];
      if (!hit || hit.distance > obstruction + 0.05) return false;
      enter();
      return true;
    },
    blocks: (x, z) => tree.blocks(x, z),
    dispose() {
      panel?.dispose();
      marker.remove();
      anchor.remove();
      tree.dispose();
    },
  };
}
