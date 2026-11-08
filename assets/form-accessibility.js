(() => {
  const controlSelector = 'input:not([type="hidden"]),select,textarea';
  const errorSelector = '.field-error,.contact-error,.verify-error';
  const aliases = {
    name: '#registerName,#fullName',
    email: '#loginEmail,#registerEmail,#recoveryEmail,#email',
    country: '#registerCountry,#country',
    password: '#loginPassword,#registerPassword,#newPassword',
    confirm: '#confirmPassword,#confirmNewPassword',
    terms: '#registerTerms,#terms',
    code: '#resetCode'
  };
  const appendDescription = (control, id) => {
    const ids = new Set((control.getAttribute('aria-describedby') || '').split(/\s+/).filter(Boolean));
    ids.add(id);
    control.setAttribute('aria-describedby', [...ids].join(' '));
  };
  const controlsForError = (form, error) => {
    if (error.classList.contains('verify-error')) return [...form.querySelectorAll('.code-inputs input')];
    const token = error.dataset.error;
    if (token) {
      const direct = form.querySelector(`#${token},[name="${token}"]`);
      if (direct) return [direct];
      const aliased = aliases[token] ? form.querySelector(aliases[token]) : null;
      if (aliased) return [aliased];
    }
    const field = error.closest('.field,.contact-field');
    if (field) return [...field.querySelectorAll(controlSelector)].slice(0, 1);
    const previous = error.previousElementSibling;
    if (previous?.matches('label')) return [...previous.querySelectorAll(controlSelector)].slice(0, 1);
    return [];
  };
  const controlIsInvalid = (control, error) => Boolean(
    (error.classList.contains('contact-error')
      ? error.closest('.contact-field,.contact-consent')?.classList.contains('invalid')
      : error.textContent.trim()) ||
    control.classList.contains('invalid') ||
    control.closest('.field,.contact-field,.contact-consent,.terms')?.classList.contains('invalid')
  );
  const syncError = (error, controls) => {
    const invalid = controls.some(control => controlIsInvalid(control, error));
    controls.forEach(control => invalid ? control.setAttribute('aria-invalid', 'true') : control.removeAttribute('aria-invalid'));
  };
  const focusTarget = target => {
    if (!target) return;
    if (!target.matches('a[href],button,input,select,textarea,[tabindex]')) target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });
    target.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };
  const isVisible = element => Boolean(element && !element.hidden && element.getClientRects().length);

  document.querySelectorAll('form').forEach((form, formIndex) => {
    const summary = document.createElement('div');
    summary.className = 'form-a11y-summary';
    summary.setAttribute('role', 'alert');
    summary.setAttribute('aria-live', 'assertive');
    form.prepend(summary);
    const pairs = [];
    const wiredErrors = new WeakSet();
    const wireError = (error, errorIndex = pairs.length) => {
      if (wiredErrors.has(error)) return;
      wiredErrors.add(error);
      if (!error.id) error.id = `${form.id || `form-${formIndex}`}-error-${errorIndex + 1}`;
      error.setAttribute('aria-live', 'polite');
      const controls = controlsForError(form, error);
      controls.forEach(control => appendDescription(control, error.id));
      pairs.push({ error, controls });
      new MutationObserver(() => syncError(error, controls)).observe(error, { childList: true, characterData: true, subtree: true });
    };
    form.querySelectorAll(errorSelector).forEach(wireError);
    new MutationObserver(records => records.forEach(record => record.addedNodes.forEach(node => {
      if (!(node instanceof Element)) return;
      if (node.matches(errorSelector)) wireError(node);
      node.querySelectorAll?.(errorSelector).forEach(wireError);
    }))).observe(form, { childList: true, subtree: true });
    form.addEventListener('invalid', event => event.target.setAttribute('aria-invalid', 'true'), true);
    form.addEventListener('input', event => {
      if (!event.target.matches(controlSelector)) return;
      const related = pairs.filter(({ controls }) => controls.includes(event.target));
      related.forEach(({ error, controls }) => syncError(error, controls));
      if (!event.target.classList.contains('invalid') && event.target.checkValidity() && related.every(({ error }) => !controlIsInvalid(event.target, error))) event.target.removeAttribute('aria-invalid');
    });
    form.addEventListener('submit', () => setTimeout(() => {
      pairs.forEach(({ error, controls }) => syncError(error, controls));
      const invalid = form.querySelector('[aria-invalid="true"],.invalid');
      if (invalid) {
        summary.textContent = '表单中有需要检查的内容，焦点已移到第一个错误字段。';
        focusTarget(invalid.matches(controlSelector) ? invalid : invalid.querySelector(controlSelector));
        return;
      }
      summary.textContent = '';
      const success = [...document.querySelectorAll('.success-panel,.verify-success,.recovery-sent,.contact-success,.assistant-output')].find(isVisible);
      if (success && (!isVisible(form) || success.matches('.contact-success,.assistant-output'))) {
        focusTarget(success?.querySelector('h1,h2,[role="status"]') || success);
      }
    }, 0));
  });

  const focusableSelector = 'a[href],button:not([disabled]),input:not([disabled]):not([type="hidden"]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';
  const openLegacyDialog = () => [...document.querySelectorAll('[role="dialog"][aria-modal="true"]')].find(dialog => dialog.classList.contains('open'));
  const dialogOpeners = new WeakMap();
  document.querySelectorAll('[role="dialog"][aria-modal="true"]').forEach(dialog => {
    dialog.setAttribute('aria-hidden', dialog.classList.contains('open') ? 'false' : 'true');
    new MutationObserver(() => {
      const open = dialog.classList.contains('open');
      dialog.setAttribute('aria-hidden', open ? 'false' : 'true');
      if (open) {
        if (!dialog.contains(document.activeElement)) dialogOpeners.set(dialog, document.activeElement);
      } else {
        const opener = dialogOpeners.get(dialog);
        if (opener?.isConnected) opener.focus();
      }
    }).observe(dialog, { attributes: true, attributeFilter: ['class'] });
  });
  document.addEventListener('keydown', event => {
    const dialog = openLegacyDialog();
    if (!dialog) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      const closer = dialog.querySelector('.dialog-close,.modal-close,[aria-label*="关闭"],#keepSession');
      closer?.click();
      return;
    }
    if (event.key !== 'Tab') return;
    const focusable = [...dialog.querySelectorAll(focusableSelector)].filter(isVisible);
    if (!focusable.length) return;
    const first = focusable[0], last = focusable.at(-1);
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  document.querySelectorAll('dialog').forEach(dialog => {
    let opener = null;
    document.querySelectorAll(`[data-open-partnership]`).forEach(button => button.addEventListener('click', () => { opener = button; }));
    dialog.addEventListener('close', () => { if (opener?.isConnected) opener.focus(); });
  });

  document.querySelectorAll('.payment-tabs[role="group"]').forEach(group => {
    const options = [...group.querySelectorAll('.payment-option')];
    options.forEach((option, index) => option.addEventListener('keydown', event => {
      let next = null;
      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = options[(index + 1) % options.length];
      if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = options[(index - 1 + options.length) % options.length];
      if (event.key === 'Home') next = options[0];
      if (event.key === 'End') next = options.at(-1);
      if (!next) return;
      event.preventDefault();
      next.focus();
      next.click();
    }));
  });
  document.querySelectorAll('.code-inputs').forEach(group => {
    const inputs = [...group.querySelectorAll('input')];
    inputs.forEach((input, index) => input.addEventListener('keydown', event => {
      if (event.key === 'ArrowLeft' && index > 0) { event.preventDefault(); inputs[index - 1].focus(); }
      if (event.key === 'ArrowRight' && index < inputs.length - 1) { event.preventDefault(); inputs[index + 1].focus(); }
      if (event.key === 'Home') { event.preventDefault(); inputs[0].focus(); }
      if (event.key === 'End') { event.preventDefault(); inputs.at(-1).focus(); }
    }));
  });
})();
