(()=>{
  try{localStorage.removeItem('5gtrip-cart')}catch{}

  const init=()=>{
    const nav=document.querySelector('.nav-links, .site-nav');
    if(!nav||nav.querySelector('.language-selector'))return;

    const selector=document.createElement('div');
    selector.className='language-selector';
    selector.dataset.odId='language-selector';
    selector.innerHTML=`
      <button class="language-trigger" type="button" aria-haspopup="menu" aria-expanded="false" aria-controls="siteLanguageMenu" aria-label="选择语言，当前为简体中文" data-od-id="language-selector-trigger">
        <span class="language-current">简体中文</span>
      </button>
      <div class="language-menu" id="siteLanguageMenu" role="menu" aria-label="语言选择" hidden>
        <button class="language-option" type="button" role="menuitemradio" aria-checked="true" data-language="zh-CN"><span class="language-option-code">ZH</span><span class="language-option-name">简体中文</span><span class="language-option-state">当前</span></button>
        <button class="language-option" type="button" role="menuitemradio" aria-checked="false" aria-disabled="true" data-language="en"><span class="language-option-code">EN</span><span class="language-option-name">English</span><span class="language-option-state">即将上线</span></button>
        <button class="language-option" type="button" role="menuitemradio" aria-checked="false" aria-disabled="true" data-language="ja"><span class="language-option-code">JA</span><span class="language-option-name">日本語</span><span class="language-option-state">即将上线</span></button>
        <button class="language-option" type="button" role="menuitemradio" aria-checked="false" aria-disabled="true" data-language="ko"><span class="language-option-code">KO</span><span class="language-option-name">한국어</span><span class="language-option-state">即将上线</span></button>
        <p class="language-status" role="status" aria-live="polite" hidden></p>
      </div>`;

    const primary=nav.querySelector('.primary-link, .nav-cta');
    nav.insertBefore(selector,primary||null);

    const trigger=selector.querySelector('.language-trigger');
    const menu=selector.querySelector('.language-menu');
    const options=[...selector.querySelectorAll('.language-option')];
    const status=selector.querySelector('.language-status');

    const setOpen=(open,focusOption=false)=>{
      trigger.setAttribute('aria-expanded',String(open));
      menu.hidden=!open;
      if(!open){status.hidden=true;status.textContent='';return}
      if(focusOption)options[0].focus();
    };

    trigger.addEventListener('click',()=>setOpen(menu.hidden,true));
    trigger.addEventListener('keydown',event=>{
      if(!['ArrowDown','ArrowUp','Home','End'].includes(event.key))return;
      event.preventDefault();
      setOpen(true);
      options[event.key==='End'||event.key==='ArrowUp'?options.length-1:0].focus();
    });

    options.forEach((option,index)=>{
      option.addEventListener('click',()=>{
        if(option.getAttribute('aria-disabled')==='true'){
          status.textContent=`${option.querySelector('.language-option-name').textContent} 版本正在准备中，当前继续使用简体中文。`;
          status.hidden=false;
          return;
        }
        setOpen(false);
        trigger.focus();
      });
      option.addEventListener('keydown',event=>{
        if(event.key==='Escape'){event.preventDefault();setOpen(false);trigger.focus();return}
        if(!['ArrowDown','ArrowUp','Home','End'].includes(event.key))return;
        event.preventDefault();
        const next=event.key==='Home'?0:event.key==='End'?options.length-1:(index+(event.key==='ArrowDown'?1:-1)+options.length)%options.length;
        options[next].focus();
      });
    });

    document.addEventListener('click',event=>{if(!selector.contains(event.target))setOpen(false)});
    document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!menu.hidden){setOpen(false);trigger.focus()}});
  };

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();
