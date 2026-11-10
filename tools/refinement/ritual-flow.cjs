const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assert = require('node:assert/strict');
(async()=>{
  const browser = await chromium.launch({channel:'chrome', headless:true, args:['--use-gl=angle','--use-angle=metal']});
  try {
    const page = await browser.newPage({viewport:{width:1000,height:690}});
    page.on('pageerror', e=>console.log('PAGE ERROR',e.stack));
    page.on('console', m=>{ if (['error','warning'].includes(m.type())) console.log('BROWSER', m.type(), m.text().slice(0,1000)); });
    page.on('response', r=>{if(r.status() >=400) console.log('HTTP',r.status(),r.url());});
    const moves=[];
    page.on('websocket',ws=>ws.on('framesent',frame=>{try{const d=JSON.parse(frame.payload);if(d.type==='move')moves.push(d)}catch{}}));
    await page.goto('http://127.0.0.1:4214/');
    await page.waitForFunction(()=>document.querySelector('#game-world canvas')?.dataset.refinement==='refined',null,{timeout:60000});
    await page.locator('#game-world canvas').focus();
    const movesBefore=moves.length;
    await page.keyboard.down('w');
    await page.waitForTimeout(550);
    await page.keyboard.up('w');
    // Local walking is checked by smoke.cjs; presence may still be connecting here.
    console.log('WALK',moves.slice(-1));

    await page.locator('#game-bow').click();
    await page.waitForFunction(()=>document.querySelector('#game-world canvas').dataset.mode==='kneel',null,{timeout:24000});
    console.log('BOW kneel');
    await page.locator('#game-bow').click();

    const seat=page.locator('.consultation-locator');
    await seat.click();
    await page.waitForFunction(()=>document.querySelector('.consultation-locator').classList.contains('is-near'),null,{timeout:28000});
    await page.locator('.consultation-anchor').filter({hasText:'与师父聊聊'}).evaluate(x=>x.click());
    await page.locator('#consultation-question').fill('如何理解无常？');
    const chat=page.waitForResponse(r=>r.url().endsWith('/api/consultation/chat'));
    await page.locator('[data-chat-form] button[type=submit]').click();
    assert.equal((await chat).status(),200);
    await page.waitForFunction(()=>document.querySelector('[data-chat-log]').textContent.length>25);
    console.log('CHAT', (await page.locator('[data-chat-log]').innerText()).slice(0,70));

    await page.locator('.consultation-tabs [data-panel=fortune]').click();
    await page.locator('#consultation-fortune-question').fill('想先准备什么');
    const ritual=page.waitForResponse(r=>r.url().endsWith('/api/consultation/ritual'));
    await page.locator('[data-intention] button[type=submit]').click();
    assert.equal((await ritual).status(),200);
    await page.locator('[data-grip]').waitFor();
    console.log('FORTUNE',await page.locator('[data-gesture-hint]').innerText());
    const grip = page.locator('[data-grip]');
    let result;
    for(let attempt=0;attempt<16 && result?.phase!=='claim';attempt++){
      await page.waitForSelector('[data-grip][data-phase="shake"]:not([hidden])');
      await grip.focus();
      for(const key of ['ArrowUp','ArrowDown','ArrowUp']) await grip.press(key);
      await page.waitForSelector('[data-grip][data-phase="confirmation"]:not([hidden])');
      const cast = page.waitForResponse(r=>r.url().endsWith('/api/consultation/ritual') && r.request().postDataJSON().action==='cast');
      await grip.press('ArrowUp');
      result = await (await cast).json();
    }
    assert.equal(result.phase,'claim');
    await page.getByRole('button',{name:'收下此签'}).click({timeout:12000});
    const reading = page.waitForResponse(r=>r.url().endsWith('/api/consultation/reading'));
    await page.locator('[data-interpret]').click();
    assert.equal((await reading).status(),200);
    await page.waitForFunction(()=>document.querySelector('[data-reading-log]').textContent.length > 15);
    await page.locator('[data-save]').click();
    console.log('FORTUNE SHAKE, CUP CAST, READING AND SAVE', result.number);
    await page.locator('.consultation-dialog [data-close]').click();

    console.log('BOW CHAT FORTUNE PASS');
  } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
