const {chromium} = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true,args:['--use-gl=angle','--use-angle=metal']});
 try{
  const page=await browser.newPage({viewport:{width:1200,height:810}});
  const errors=[];
  page.on('pageerror',e=>{errors.push(e.message);console.error(e.stack);});
  page.on('console',m=>{if(['error','warning'].includes(m.type()))console.log(m.type(),m.text().slice(0,500));});
  await page.route('**/assets/game-B7kPresence.js*',async route=>{
   const result=await route.fetch();
   const body=(await result.text()).replace('const world={','window.testTemple=this;const world={');
   await route.fulfill({response:result,body});
  });
  await page.goto('http://127.0.0.1:4214/?room=maru-12');
  await page.waitForSelector('.wish-locator',{timeout:45000});
  await page.waitForFunction(()=>window.testTemple?.isReady,{},{timeout:45000});
  await page.waitForFunction(()=>document.querySelector('#game-world canvas')?.dataset.refinement==='refined');
  const site = await page.evaluate(()=>{
   const w=window.testTemple;
   const tree=w.scene.getObjectByName('许愿树');
   return {root:tree.position.toArray(),meshes:tree.children.length,blocks:w.consultation.blocks(-30,52.6),old:!!w.scene.getObjectByName('Cheongyeon-timber-devotional-hall')};
  });
  console.log('SITE',site);
  assert.equal(site.root[0],-30); assert.equal(site.root[2],52.6); assert.ok(site.old); assert.ok(site.blocks);
  const screenshot=await page.evaluate(async()=>{
    const w=window.testTemple;
    await w.sanctuary.completeGarden();
    const camera=w.camera.clone();
    camera.position.set(-13,5.2,32.8);
    camera.lookAt(-29,4.2,46.5);
    camera.updateMatrixWorld();
    w.renderer.render(w.scene,camera);
    return w.renderer.domElement.toDataURL('image/png').split(',')[1];
  });
  fs.writeFileSync('/tmp/sansa-wish-across-pond.png',Buffer.from(screenshot,'base64'));
  await page.locator('.wish-locator').click();
  const route = await page.evaluate(()=>window.testTemple.walkJourney?.route);
  console.log('ROUTE',route);
  assert.ok(route?.length);
  let prev={x:0,z:18.8};
  for(const point of route){
   for(let t=0;t<=1;t+=0.02){
    const x=prev.x+(point.x-prev.x)*t, z=prev.z+(point.z-prev.z)*t;
    assert.ok(Math.hypot(x+28,z-36) >= 6.48,'route crosses pond');
    assert.ok(Math.hypot(x+30,z-52.6)>=2.75,'route crosses tree roots');
   }
   prev=point;
  }
  await page.waitForSelector('.wish-anchor:visible,.wish-locator.is-near:visible',{timeout:55000});
  await page.waitForFunction(()=>!window.testTemple.walkJourney);
  console.log('ARRIVED', await page.evaluate(()=>window.testTemple.self.group.position.toArray()));
  await page.waitForFunction(()=>window.testTemple.cameraFrame().look.y>3 && window.testTemple.lookPoint.distanceTo(window.testTemple.cameraFrame().look)<0.25);
  await page.screenshot({path:'/tmp/sansa-wish-at-tree.png'});
  await page.locator('.wish-anchor:visible,.wish-locator.is-near:visible').first().click();
  for(const [index,wish] of ['希望奶奶这个冬天过得安稳一些','希望我能有勇气迈出新的第一步'].entries()){
   await page.locator('#wish-text').fill(wish);
   const response=page.waitForResponse(r=>r.url().endsWith('/api/consultation/wish'));
   await page.locator('[data-hang]').click();
   assert.equal((await response).status(),200);
   await page.waitForSelector('[data-card-verse]:visible',{timeout:15000});
   console.log('CARD',index,await page.locator('[data-card-verse]').innerText());
   await page.locator('[data-save-card]').click();
   await page.waitForFunction(()=>document.querySelector('[data-save-card]').disabled);
   await page.locator('[data-close-card]').click();
  }
  await page.locator('.wish-dialog [data-panel="placards"]').click();
  assert.equal(await page.locator('.wish-placard').count(),2);
  const getTarget=()=>page.evaluate(()=>{
   const w=window.testTemple;
   const view=w.consultation.cameraFrame();
   return view?.look.toArray();
  });
  await page.getByRole('button',{name:'在树上找到'}).first().click();
  await page.waitForSelector('.wish-dialog[open]',{state:'hidden',timeout:3000}).catch(async error=>{
   console.log('AFTER FIND',await page.evaluate(()=>({open:document.querySelector('.wish-dialog').open,focus:document.activeElement?.outerHTML.slice(0,200)})));
   throw error;
  });
  const a=await getTarget();
  console.log('FIRST TARGET',a);
  await page.locator('.wish-anchor:visible,.wish-locator.is-near:visible').first().click();
  await page.locator('.wish-dialog [data-panel="placards"]').click();
  await page.getByRole('button',{name:'在树上找到'}).last().click();
  const b=await getTarget();
  console.log('DISTINCT PLAQUES',a,b);
  assert.ok(Math.hypot(...a.map((value,i)=>value-b[i]))>0.15);
  await page.waitForSelector('.wish-dialog[open]',{state:'hidden'});
  await page.reload();
  await page.waitForSelector('.wish-locator',{timeout:45000});
  await page.waitForFunction(()=>window.testTemple?.isReady);
  await page.evaluate(()=>{
    const w=window.testTemple;
    w.self.group.position.set(-26.4,-1.14,49.1);
    w.yaw=Math.atan2(3.6,-3.5);
    w.cameraSnap();
  });
  await page.locator('.wish-anchor:visible,.wish-locator.is-near:visible').first().click();
  await page.locator('.wish-dialog [data-panel="placards"]').click();
  assert.equal(await page.locator('.wish-placard').count(),2);
  await page.getByRole('button',{name:'重读卡片'}).first().click();
  await page.waitForSelector('[data-card-verse]:visible');
  console.log('RELOAD AND REREAD');
  assert.deepEqual(errors,[]);
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
