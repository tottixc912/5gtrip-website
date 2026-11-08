(()=>{
  const ready=callback=>document.readyState==='loading'?document.addEventListener('DOMContentLoaded',callback,{once:true}):callback();
  ready(()=>{
    document.querySelectorAll('.site-footer a[href^="mailto:support@5gtrip.example"],.footer a[href^="mailto:support@5gtrip.example"]').forEach(link=>link.setAttribute('href','contact.html'));
    if(document.querySelector('#supportChatLauncher'))return;

    const root=document.createElement('div');
    root.className='support-chat';
    root.innerHTML=`
      <button class="support-chat-launcher" id="supportChatLauncher" type="button" aria-expanded="false" aria-controls="supportChatPanel">
        <span class="support-chat-launcher-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M5 5.5h14v10H9l-4 3v-13Z"/><path d="M8 9h8M8 12h5"/></svg></span>
        <span class="support-chat-launcher-copy"><strong>在线客服</strong><small>演示助手在线</small></span>
      </button>
      <section class="support-chat-panel" id="supportChatPanel" role="dialog" aria-modal="false" aria-labelledby="supportChatTitle" hidden>
        <header class="support-chat-head"><div><span class="support-chat-avatar" aria-hidden="true">5G</span><div><strong id="supportChatTitle">5GTrip 在线客服</strong><small><i></i> 演示助手在线</small></div></div><button class="support-chat-close" type="button" aria-label="关闭在线客服">×</button></header>
        <div class="support-chat-notice">当前为本地演示，不会发送或保存消息。请勿输入密码、支付信息或完整激活码。</div>
        <div class="support-chat-messages" id="supportChatMessages" aria-live="polite"><div class="support-chat-message bot"><span>你好，我是 5GTrip 演示助手。请选择问题类型，或直接描述你遇到的情况。</span></div></div>
        <div class="support-chat-quick" aria-label="常见问题快捷入口"><button type="button" data-topic="order">查询订单</button><button type="button" data-topic="install">安装联网</button><button type="button" data-topic="refund">退款进度</button></div>
        <form class="support-chat-form"><label class="sr-only" for="supportChatInput">描述你的问题</label><input id="supportChatInput" maxlength="180" autocomplete="off" placeholder="输入问题…"><button type="submit" aria-label="发送消息">↑</button></form>
      </section>`;
    document.body.append(root);

    const launcher=root.querySelector('#supportChatLauncher'),panel=root.querySelector('#supportChatPanel'),close=root.querySelector('.support-chat-close'),messages=root.querySelector('#supportChatMessages'),form=root.querySelector('.support-chat-form'),input=root.querySelector('#supportChatInput');
    const answers={
      order:{question:'我想查询订单',answer:'请先进入订单中心查看支付、交付与激活状态。',label:'打开订单中心',href:'orders.html'},
      install:{question:'eSIM 无法安装或联网',answer:'建议先检查设备兼容性、数据漫游和移动网络设置。',label:'查看使用指南',href:'how-to-use.html'},
      refund:{question:'我想查询退款进度',answer:'已提交退款申请时，可在退款进度页查看当前审核节点。',label:'查看退款进度',href:'refund-status.html'}
    };
    const append=(kind,text,action)=>{const item=document.createElement('div');item.className=`support-chat-message ${kind}`;const bubble=document.createElement('span');bubble.textContent=text;item.append(bubble);if(action){const link=document.createElement('a');link.href=action.href;link.textContent=action.label;item.append(link)}messages.append(item);messages.scrollTop=messages.scrollHeight};
    const respond=value=>{const normalized=value.toLowerCase();if(/退款|退费|refund/.test(normalized))return answers.refund;if(/安装|激活|联网|信号|apn|漫游/.test(normalized))return answers.install;if(/订单|支付|发放|二维码|order/.test(normalized))return answers.order;return{answer:'我暂时无法识别这个问题。你可以查看常见问题，或选择上方的订单、安装、退款快捷入口。',label:'查看常见问题',href:'faq.html'}};
    const toggle=open=>{panel.hidden=!open;launcher.setAttribute('aria-expanded',String(open));root.classList.toggle('open',open);if(open)setTimeout(()=>input.focus(),0);else launcher.focus()};
    launcher.addEventListener('click',()=>toggle(panel.hidden));
    document.querySelectorAll('[data-open-support-chat]').forEach(trigger=>trigger.addEventListener('click',event=>{event.preventDefault();toggle(true)}));
    close.addEventListener('click',()=>toggle(false));
    root.querySelectorAll('[data-topic]').forEach(button=>button.addEventListener('click',()=>{const item=answers[button.dataset.topic];append('user',item.question);setTimeout(()=>append('bot',item.answer,item),180)}));
    form.addEventListener('submit',event=>{event.preventDefault();const value=input.value.trim();if(!value)return;append('user',value);input.value='';const answer=respond(value);setTimeout(()=>append('bot',answer.answer,answer),180)});
    document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!panel.hidden)toggle(false)});
  });
})();
