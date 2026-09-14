// Original tiny arcade games. World coordinates stay stable across layout changes.
const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));
const overlaps=(a,b)=>a.x<b.x+b.w && a.x+a.w>b.x && a.y<b.y+b.h && a.y+a.h>b.y;
const resize=(game,width,height)=>Object.assign(game,{width,height});
const scaleFor=game=>Math.min(game.width/(game.traffic?300:400),(game.height-180)/360);
function begin(ctx,game) {
  ctx.fillStyle='#102d35'; ctx.fillRect(0,0,game.width,game.height);
  const scale=scaleFor(game);
  ctx.save(); ctx.translate((game.width-480*scale)/2,90+(game.height-180-360*scale)/2); ctx.scale(scale,scale);
  ctx.beginPath(); ctx.rect(0,0,480,360); ctx.clip();
}
const course=[
  [0,290,360],[410,270,240],[700,245,220],[975,285,240],
  [1260,260,240],[1550,235,240],[1840,275,240],[2130,250,340]
].map(([x,y,w])=>({x,y,w,h:100}));
export const platform={
  title:'Skyline Run',
  instructions:'Auto-run. Jump: Space, Up or W. Touch or click to jump. Reach the flag.',
  create(width,height) { return {width,height,status:'playing',player:{x:40,y:266,w:20,h:24,vy:0,grounded:true},score:0,lives:3,checkpoint:0,invulnerable:0,coins:course.map(p=>({x:p.x+p.w*.65,y:p.y-42,w:12,h:12,taken:false}))}; },
  resize,
  step(game,elapsed,input={}) {
    if(game.status!=='playing')return;
    const dt=clamp(elapsed,0,.033),p=game.player;
    game.invulnerable=Math.max(0,game.invulnerable-dt);
    if(input.jump && p.grounded) {p.vy=-570;p.grounded=false;}
    const previousBottom=p.y+p.h;
    p.x+=180*dt; p.vy+=1500*dt; p.y+=p.vy*dt; p.grounded=false;
    for(let i=0;i<course.length;i++) {
      const tile=course[i];
      if(p.vy>=0 && p.x+p.w>tile.x && p.x<tile.x+tile.w && previousBottom<=tile.y+.1 && p.y+p.h>=tile.y) {
        p.y=tile.y-p.h;p.vy=0;p.grounded=true;game.checkpoint=i;break;
      }
    }
    for(const coin of game.coins)if(!coin.taken && overlaps(p,coin)) {coin.taken=true;game.score+=100;}
    if(p.y>390) {
      game.lives--;
      if(game.lives<=0) {game.status='lost';return;}
      const tile=course[game.checkpoint];
      Object.assign(p,{x:tile.x+20,y:tile.y-p.h,vy:0,grounded:true});game.invulnerable=1;
    }
    if(p.x>=2380) {game.status='won';game.score+=game.lives*200;}
  },
  hud:game=>`Gems ${game.coins.filter(c=>c.taken).length} / 8 · Lives ${game.lives}`,
  victory:game=>`Rooftop reached. Final score: ${game.score}.`,
  draw(ctx,game) {
    begin(ctx,game);
    ctx.fillStyle='#1c424d';
    for(let i=0;i<9;i++)ctx.fillRect(i*70-(game.player.x*.2%70),170+(i%3)*25,48,190);
    const camera=Math.max(0,game.player.x-120);
    ctx.translate(-camera,0);
    for(const tile of course) {
      ctx.fillStyle='#456a70';ctx.fillRect(tile.x,tile.y,tile.w,tile.h);
      ctx.fillStyle='#a4d4c4';ctx.fillRect(tile.x,tile.y,tile.w,6);
      ctx.fillStyle='#173741';for(let x=tile.x+15;x<tile.x+tile.w;x+=35)ctx.fillRect(x,tile.y+24,12,16);
    }
    ctx.fillStyle='#f2d39e';for(const coin of game.coins)if(!coin.taken)ctx.fillRect(coin.x,coin.y,coin.w,coin.h);
    ctx.fillStyle='#e5f2ef';ctx.fillRect(2400,175,4,75);ctx.fillStyle='#86c4af';ctx.fillRect(2404,175,30,20);
    const p=game.player;
    ctx.fillStyle=game.invulnerable?'#f2d39e':'#e5f2ef';ctx.fillRect(p.x+3,p.y,14,9);
    ctx.fillStyle='#8dc9b6';ctx.fillRect(p.x,p.y+9,20,10);
    ctx.fillStyle='#e5f2ef';ctx.fillRect(p.x,p.y+19,7,5);ctx.fillRect(p.x+13,p.y+19,7,5);
    ctx.fillStyle='#173741';ctx.fillRect(p.x+13,p.y+3,3,3);
    ctx.restore();
  }
};
const lanes=[150,240,330];
export const race={
  title:'Pocket Circuit',
  instructions:'Steer: Left / Right or A D. Touch or mouse: drag to steer. Finish 45 seconds.',
  create(width,height) {return {width,height,status:'playing',player:{x:226,y:275,w:28,h:46},traffic:[],time:0,spawn:.8,sequence:0,score:0,lives:3,invulnerable:0};},
  resize,
  step(game,elapsed,input={}) {
    if(game.status!=='playing')return;
    const dt=clamp(elapsed,0,.033),p=game.player;
    game.time+=dt;game.score=Math.floor(game.time*100);game.invulnerable=Math.max(0,game.invulnerable-dt);
    if(input.targetX!==undefined) {
      const scale=scaleFor(game);
      const target=(input.targetX-(game.width-480*scale)/2)/scale-p.w/2;
      p.x+=clamp(target-p.x,-300*dt,300*dt);
    } else p.x+=((input.right?1:0)-(input.left?1:0))*260*dt;
    p.x=clamp(p.x,110,370-p.w);
    const speed=135+Math.min(75,game.time*2);
    game.spawn-=dt;
    if(game.spawn<=0) {
      const lane=[0,2,1,0,1,2,0,2,1,2,0][game.sequence++%11];
      game.traffic.push({x:lanes[lane]-14,y:-50,w:28,h:46});game.spawn=1.15;
    }
    for(const car of game.traffic) {
      car.y+=speed*dt;
      if(!game.invulnerable && overlaps(p,car)) {game.lives--;game.invulnerable=1.5;car.y=400;}
    }
    game.traffic=game.traffic.filter(car=>car.y<380);
    if(game.lives<=0)game.status='lost';else if(game.time>=45)game.status='won';
  },
  hud:game=>`Finish in ${Math.max(0,Math.ceil(45-game.time))}s / Lives ${game.lives}`,
  victory:game=>`Finish line crossed. ${game.lives} ${game.lives===1?'life':'lives'} remaining.`,
  draw(ctx,game) {
    begin(ctx,game);
    ctx.fillStyle='#244e49';ctx.fillRect(0,0,480,360);
    ctx.fillStyle='#223b43';ctx.fillRect(100,0,280,360);
    ctx.fillStyle='#a4d4c4';ctx.fillRect(100,0,4,360);ctx.fillRect(376,0,4,360);
    ctx.fillStyle='#738b8e';
    for(let y=-50;y<360;y+=60)for(const x of [195,285])ctx.fillRect(x,y+(game.time*160%60),3,26);
    ctx.fillStyle='#709889';
    for(let y=-70;y<360;y+=100)for(const x of [48,418])ctx.fillRect(x,y+(game.time*130%100),14,28);
    const car=(p,color)=>{ctx.fillStyle='#0b242c';ctx.fillRect(p.x-3,p.y+6,p.w+6,p.h-12);ctx.fillStyle=color;ctx.fillRect(p.x,p.y,p.w,p.h);ctx.fillStyle='#1d414b';ctx.fillRect(p.x+4,p.y+9,p.w-8,10);ctx.fillRect(p.x+4,p.y+31,p.w-8,7);ctx.fillStyle='#fff0cc';ctx.fillRect(p.x+2,p.y+2,5,3);ctx.fillRect(p.x+p.w-7,p.y+2,5,3);};
    for(const traffic of game.traffic)car(traffic,'#d6ae86');
    car(game.player,game.invulnerable?'#f2d39e':'#bde6d8');
    ctx.restore();
  }
};
