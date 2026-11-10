const {chromium} = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true,args:['--use-gl=angle','--use-angle=metal']});
 try{
  const page=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
  await page.route('**/assets/game-B7kPresence.js*',async route=>{
   const result=await route.fetch();
   const body=(await result.text()).replace('const world={','window.testTemple=this;const world={');
   await route.fulfill({response:result,body});
  });
  await page.goto('http://127.0.0.1:4214/?room=maru-11');
  await page.waitForSelector('.wish-locator',{timeout:45000});
  await page.waitForFunction(()=>window.testTemple.isReady);
  await page.waitForFunction(()=>document.querySelector('#game-world canvas')?.dataset.refinement==='refined');
  await page.evaluate(()=>{
   const w=window.testTemple;
   w.self.group.position.set(-26.4,-1.14,49.1);
   w.yaw=Math.atan2(3.6,-3.5);
   w.cameraSnap();
  });
  await page.waitForFunction(()=>window.testTemple.self.group.position.x < -25 && document.querySelector('.wish-locator.is-near'));
  const target=await page.evaluate(()=>{
   const w=window.testTemple,c=w.camera;
   const point=c.position.clone().set(-30,0.4,52.6).project(c);
   const b=w.renderer.domElement.getBoundingClientRect();
   return {x:b.left+(point.x+1)*b.width/2,y:b.top+(1-point.y)*b.height/2};
  });
  await page.touchscreen.tap(target.x,target.y);
  await page.waitForSelector('#wish-text:visible',{timeout:5000});
  assert.ok(await page.locator('[data-hang]').isVisible());
  console.log('MOBILE TRUNK TAP AND FORM',target);
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
