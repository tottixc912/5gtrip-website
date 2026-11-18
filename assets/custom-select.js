(()=>{
  const selector='select:not(.destination-native):not([data-custom-select="off"])';
  const flagMap={'日本':'🇯🇵','韩国':'🇰🇷','泰国':'🇹🇭','新加坡':'🇸🇬','美国':'🇺🇸','英国':'🇬🇧','法国':'🇫🇷','德国':'🇩🇪','澳大利亚':'🇦🇺','中国大陆':'🇨🇳','中国香港':'🇭🇰','中国澳门':'🇲🇴','其他':'🌍','其他国家或地区':'🌍'};
  let sequence=0,openSelect=null;
  const icons={
    pin:'<path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"></path><circle cx="12" cy="10" r="2.5"></circle>',
    globe:'<circle cx="12" cy="12" r="9"></circle><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"></path>',
    device:'<rect x="6" y="2.5" width="12" height="19" rx="2.5"></rect><path d="M10 18h4"></path>',
    usage:'<path d="M4 18V12M10 18V8M16 18V4M3 18h18"></path>',
    message:'<path d="M5 5h14v11H9l-4 3V5Z"></path><path d="M8 9h8M8 12h5"></path>',
    sort:'<path d="M8 6h10M8 12h7M8 18h4M4 4v16M2 18l2 2 2-2"></path>',
    brand:'<path d="M4 5h8l8 8-7 7-8-8V5Z"></path><circle cx="8.5" cy="9" r="1"></circle>',
    calendar:'<rect x="3" y="5" width="18" height="16" rx="2"></rect><path d="M7 3v4M17 3v4M3 10h18"></path>',
    partnership:'<path d="m7 12 3 3 7-7"></path><path d="M3 8h4l3-3 4 3h7M3 16h4l3 3 4-3h7"></path>',
    document:'<path d="M6 3h9l3 3v15H6V3Z"></path><path d="M14 3v4h4M9 11h6M9 15h6"></path>',
    status:'<circle cx="12" cy="12" r="9"></circle><path d="m8 12 2.5 2.5L16 9"></path>',
    default:'<path d="M5 7h14M5 12h14M5 17h14"></path>'
  };
  const iconType=select=>{
    if(select.dataset.customSelectIcon)return select.dataset.customSelectIcon;
    const key=`${select.id} ${select.name} ${select.getAttribute('aria-label')||''}`.toLowerCase();
    if(/destination/.test(key))return'pin';
    if(/country/.test(key))return'globe';
    if(/device/.test(key))return'device';
    if(/usage/.test(key))return'usage';
    if(/sms/.test(key))return'message';
    if(/sort/.test(key))return'sort';
    if(/brand/.test(key))return'brand';
    if(/days/.test(key))return'calendar';
    if(/partnership/.test(key))return'partnership';
    if(/reason/.test(key))return'document';
    if(/status/.test(key))return'status';
    return'default';
  };
  const labelText=select=>{
    if(select.getAttribute('aria-label'))return select.getAttribute('aria-label');
    const explicit=select.id&&document.querySelector(`label[for="${CSS.escape(select.id)}"]`);
    const label=explicit||select.closest('label');
    if(!label)return'选择选项';
    const title=[...label.children].find(node=>node.tagName==='SPAN'&&!node.classList.contains('field-error')&&!node.classList.contains('skip'));
    return(title?.textContent||'选择选项').trim();
  };
  const enhance=select=>{
    if(select.dataset.customSelectReady==='true')return;
    select.dataset.customSelectReady='true';
    const base=select.id||`siteSelect${++sequence}`,triggerId=`${base}Trigger`,menuId=`${base}Menu`;
    const wrapper=document.createElement('div');wrapper.className='site-select';
    if(select.classList.contains('sort')||select.id==='unlimitedDays'||select.closest('.catalog-meta,.unlimited'))wrapper.classList.add('site-select--compact');
    select.before(wrapper);wrapper.append(select);select.classList.add('site-select-native');select.tabIndex=-1;select.setAttribute('aria-hidden','true');
    const trigger=document.createElement('button');trigger.type='button';trigger.className='site-select-trigger';trigger.id=triggerId;trigger.setAttribute('aria-haspopup','listbox');trigger.setAttribute('aria-expanded','false');trigger.setAttribute('aria-controls',menuId);
    const type=iconType(select);trigger.innerHTML=`<span class="site-select-copy"><span class="site-select-icon" aria-hidden="true"><svg viewBox="0 0 24 24">${icons[type]||icons.default}</svg></span><span class="site-select-value"></span></span><svg class="site-select-chevron" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 7 5 5 5-5"></path></svg>`;
    const valueNode=trigger.querySelector('.site-select-value'),menu=document.createElement('div');menu.className='site-select-menu';menu.id=menuId;menu.role='listbox';menu.hidden=true;wrapper.append(trigger,menu);
    const title=labelText(select);
    const close=(restore=false)=>{menu.hidden=true;trigger.setAttribute('aria-expanded','false');wrapper.classList.remove('site-select--up');if(openSelect?.trigger===trigger)openSelect=null;if(restore)trigger.focus()};
    const optionButtons=()=>[...menu.querySelectorAll('.site-select-option')];
    const sync=()=>{const option=select.options[select.selectedIndex];valueNode.textContent=option?.textContent.trim()||'请选择';valueNode.classList.toggle('is-placeholder',!option?.value);trigger.disabled=select.disabled;trigger.setAttribute('aria-label',`${title}：${valueNode.textContent}`);optionButtons().forEach((button,index)=>button.setAttribute('aria-selected',String(index===select.selectedIndex)));if(!select.required||select.value)trigger.removeAttribute('aria-invalid')};
    const choose=index=>{const option=select.options[index];if(!option||option.disabled)return;const changed=select.selectedIndex!==index;select.selectedIndex=index;sync();if(changed){select.dispatchEvent(new Event('input',{bubbles:true}));select.dispatchEvent(new Event('change',{bubbles:true}))}close(true)};
    const render=()=>{menu.replaceChildren();[...select.options].forEach((option,index)=>{const button=document.createElement('button');button.type='button';button.className='site-select-option';button.role='option';button.dataset.index=String(index);button.disabled=option.disabled;const mark=option.dataset.icon||flagMap[option.textContent.trim()];button.innerHTML=`${mark?`<span class="site-select-option-mark" aria-hidden="true">${mark}</span>`:''}<span class="site-select-option-text"></span>`;button.querySelector('.site-select-option-text').textContent=option.textContent.trim();button.addEventListener('click',()=>choose(index));menu.append(button)});sync()};
    const open=(edge='selected')=>{if(openSelect&&openSelect.trigger!==trigger)openSelect.close();menu.hidden=false;trigger.setAttribute('aria-expanded','true');wrapper.classList.toggle('site-select--up',trigger.getBoundingClientRect().bottom+Math.min(286,menu.scrollHeight)+12>window.innerHeight&&trigger.getBoundingClientRect().top>Math.min(286,menu.scrollHeight));openSelect={trigger,close};const buttons=optionButtons().filter(button=>!button.disabled);const selected=buttons.find(button=>Number(button.dataset.index)===select.selectedIndex);requestAnimationFrame(()=>{if(edge==='last')buttons.at(-1)?.focus();else if(edge==='first')buttons[0]?.focus();else(selected||buttons[0])?.focus()})};
    trigger.addEventListener('click',()=>menu.hidden?open():close());
    trigger.addEventListener('keydown',event=>{if(['ArrowDown','ArrowUp','Home','End'].includes(event.key)){event.preventDefault();open(event.key==='ArrowUp'||event.key==='End'?'last':event.key==='Home'?'first':'selected')}else if(event.key==='Escape')close()});
    menu.addEventListener('keydown',event=>{const buttons=optionButtons().filter(button=>!button.disabled),index=buttons.indexOf(document.activeElement);let next=index;if(event.key==='ArrowDown')next=(index+1)%buttons.length;else if(event.key==='ArrowUp')next=(index-1+buttons.length)%buttons.length;else if(event.key==='Home')next=0;else if(event.key==='End')next=buttons.length-1;else if(event.key==='Escape'){event.preventDefault();close(true);return}else if(event.key==='Tab'){close();return}else return;event.preventDefault();buttons[next]?.focus()});
    select.addEventListener('change',sync);select.addEventListener('focus',()=>trigger.focus());select.addEventListener('invalid',event=>{event.preventDefault();trigger.setAttribute('aria-invalid','true');trigger.focus()});
    select.form?.addEventListener('reset',()=>setTimeout(sync));
    new MutationObserver(render).observe(select,{childList:true,subtree:true,attributes:true,attributeFilter:['disabled','label','selected']});render();
  };
  const scan=root=>{if(root.matches?.(selector))enhance(root);root.querySelectorAll?.(selector).forEach(enhance)};
  scan(document);
  new MutationObserver(records=>records.forEach(record=>record.addedNodes.forEach(node=>{if(node.nodeType===1)scan(node)}))).observe(document.body,{childList:true,subtree:true});
  document.addEventListener('pointerdown',event=>{if(openSelect&&!openSelect.trigger.closest('.site-select').contains(event.target))openSelect.close()});
  window.addEventListener('resize',()=>openSelect?.close());
})();
