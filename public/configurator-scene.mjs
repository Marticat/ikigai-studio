import {normalizeConfig,presets,profiles,glasses,lights} from './configurator-model.mjs';

// All geometry uses normalized numbers and allowlisted materials, never raw user input.
export function wardrobeScene(input,{doorsOpen=false}={}){
 const c=normalizeConfig(input),preset=presets[c.preset],profile=profiles[c.profile],glass=glasses[c.glass],light=lights[c.light];
 const scale=Math.min(770/c.width,550/c.height),w=c.width*scale,h=c.height*scale,x=(1000-w)/2-15,y=650-h,bay=(w-24)/3,depth=26,lit=c.light!=='off';
 const plane=(bx,by,bw,fill='#9c9381')=>`<path data-shelf="true" d="M${bx} ${by}h${bw}l${depth} -14h-${bw}Z" fill="${fill}"/><rect x="${bx}" y="${by}" width="${bw}" height="6" fill="${profile.color}"/><path d="M${bx} ${by}h${bw}" stroke="${profile.edge}" stroke-width="1"/>`;
 let contents='',fronts='';
 preset.bays.forEach((b,index)=>{
  const bx=x+12+bay*index,bw=bay-8,top=y+12,bottom=y+h-13,drawerH=h*.082,drawerTop=bottom-b.drawers*drawerH;
  contents+=`<g class="wardrobe-bay" data-bay="${b.type}"><rect x="${bx}" y="${top}" width="${bw}" height="${h-25}" fill="url(#backPanel)"/><path d="M${bx+6} ${top}v${h-25}" stroke="#272a21" opacity=".4"/>`;
  if(lit)contents+=`<rect x="${bx+2}" y="${top+3}" width="5" height="${h-35}" rx="2" fill="${light.color}" filter="url(#ledGlow)" opacity=".65"/><rect x="${bx+2}" y="${top+3}" width="2" height="${h-35}" fill="${light.color}"/>`;
  const topShelf=top+h*.13;
  contents+=plane(bx,topShelf,bw);
  if(b.type==='hang'){
   const rail=topShelf+h*.075;
   contents+=`<path data-rail="true" d="M${bx+9} ${rail}h${bw-18}" stroke="${profile.edge}" stroke-width="4"/>`;
   if(b.shelves>1){const sy=drawerTop-h*.09;contents+=plane(bx,sy,bw);}
  }else{
   const spacing=(drawerTop-topShelf)/(b.shelves+.1);
   for(let k=1;k<b.shelves;k++){const sy=topShelf+spacing*k;contents+=plane(bx,sy,bw);}
  }
  for(let k=0;k<b.drawers;k++){const dy=drawerTop+k*drawerH;contents+=`<g data-drawer="true"><rect x="${bx+1}" y="${dy+2}" width="${bw-2}" height="${drawerH-3}" fill="url(#drawerPanel)" stroke="#45493d" stroke-width="1"/><path d="M${bx+8} ${dy+7}h${bw-16}" stroke="#c7c1ab" opacity=".25"/><path d="M${bx+bw*.37} ${dy+10}h${bw*.26}" stroke="${profile.color}" stroke-width="3"/></g>`;}
  contents+='</g>';
  if(c.glass!=='open'){
   const doorX=bx-3,doorW=bay-2;
   fronts+=`<g class="glass-leaf" data-glass="${c.glass}" transform="translate(${doorX} 0) scale(${doorsOpen?.12:1} 1)"><rect x="0" y="${y+5}" width="${doorW}" height="${h-10}" fill="${glass.color}" fill-opacity="${glass.opacity}" stroke="${profile.color}" stroke-width="5"/><rect x="3" y="${y+8}" width="${doorW-6}" height="${h-16}" fill="url(#glassReflection)" opacity="${doorsOpen?.35:.55}"/><path d="M${doorW*.18} ${y+12}L${doorW*.74} ${y+h-12}" stroke="#fff" stroke-width="${doorW*.12}" opacity=".055"/><path d="M${doorW-11} ${y+h*.45}v${h*.13}" stroke="${profile.edge}" stroke-width="3"/></g>`;
  }
 });
 return `<svg viewBox="0 0 1000 780" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="scene-title scene-description"><title id="scene-title">Гардеробная: ${preset.name}</title><desc id="scene-description">Ширина ${c.width}, высота ${c.height}, глубина 60 сантиметров. Профиль ${profile.name}, ${glass.name.toLowerCase()}${c.glass==='open'?'':' стекло'}. ${light.name}. Схема конструкции без одежды и аксессуаров.</desc><defs>
 <linearGradient id="room" x2="0" y2="1"><stop stop-color="#dedbd1"/><stop offset="1" stop-color="#a9aaa0"/></linearGradient><linearGradient id="backPanel" x2="1" y2="0"><stop stop-color="#716f60"/><stop offset=".35" stop-color="#8c8976"/><stop offset="1" stop-color="#aaa18b"/></linearGradient><linearGradient id="drawerPanel" x2="0" y2="1"><stop stop-color="#a8a28d"/><stop offset="1" stop-color="#848574"/></linearGradient><linearGradient id="glassReflection" x1="0" y1="0" x2="1" y2=".5"><stop stop-color="#fff" stop-opacity=".25"/><stop offset=".38" stop-color="#fff" stop-opacity=".02"/><stop offset=".7" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#dbe6e2" stop-opacity=".2"/></linearGradient><radialGradient id="ambient"><stop stop-color="${light.color}" stop-opacity=".23"/><stop offset="1" stop-color="${light.color}" stop-opacity="0"/></radialGradient><filter id="ledGlow" x="-500%" y="-20%" width="1100%" height="140%"><feGaussianBlur stdDeviation="7"/></filter><filter id="floorBlur" x="-30%" y="-100%" width="160%" height="300%"><feGaussianBlur stdDeviation="13"/></filter><pattern id="wallgrain" width="5" height="5" patternUnits="userSpaceOnUse"><path d="M1 1h1" stroke="#fff" stroke-opacity=".1"/></pattern></defs>
 <rect width="1000" height="780" fill="url(#room)"/><rect width="1000" height="780" fill="url(#wallgrain)"/><path d="M0 652h1000v128H0Z" fill="#b5b4a8"/><path d="M0 652h1000" stroke="#8d9083" opacity=".3"/><path d="M180 652L60 780M480 652l-20 128M780 652l100 128" stroke="#8e9181" opacity=".17"/>
 ${lit?`<ellipse cx="500" cy="380" rx="470" ry="370" fill="url(#ambient)"/>`:''}<ellipse cx="510" cy="664" rx="${w*.55}" ry="23" fill="#2e3527" opacity=".28" filter="url(#floorBlur)"/>
 <g class="scene-object"><path d="M${x+w} ${y}l${depth} -18v${h}l-${depth} 18Z" fill="${profile.color}"/><path d="M${x} ${y}l${depth} -18h${w}l-${depth} 18Z" fill="${profile.edge}"/><rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#363c30"/>
 ${contents}<g class="profile-lines" fill="${profile.color}"><rect x="${x}" y="${y}" width="7" height="${h}"/><rect x="${x+w-7}" y="${y}" width="7" height="${h}"/><rect x="${x}" y="${y}" width="${w}" height="6"/><rect x="${x}" y="${y+h-7}" width="${w}" height="7"/>${[1,2].map(i=>`<rect x="${x+8+bay*i}" y="${y+3}" width="5" height="${h-6}"/>`).join('')}</g>${fronts}
 <path d="M${x+1} ${y+1}h${w-2}" stroke="${profile.edge}" stroke-width="1.3"/>
 </g><g fill="#4e5648" stroke="#626a59" stroke-width="1" font-family="Manrope,Arial,sans-serif" font-size="14"><path d="M${x} 695h${w}M${x} 689v12M${x+w} 689v12"/><rect x="${x+w/2-45}" y="684" width="90" height="23" fill="#b5b4a8" stroke="none"/><text x="${x+w/2}" y="700" text-anchor="middle" stroke="none">${c.width} см</text><path d="M${x-37} ${y}v${h}M${x-43} ${y}h12M${x-43} ${y+h}h12"/><text x="${x-47}" y="${y+h/2}" text-anchor="middle" transform="rotate(-90 ${x-47} ${y+h/2})" stroke="none">${c.height} см</text></g><text x="500" y="748" text-anchor="middle" fill="#6b7262" font-family="Manrope,Arial,sans-serif" font-size="10" letter-spacing="2">IKIGAI / ВАШЕ ПРОСТРАНСТВО</text></svg>`;
}
