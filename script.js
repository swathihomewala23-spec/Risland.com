(() => {
  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];
  const config = window.ENQUIRY_CONFIG || {};
  const enquiryModal = $('#enquiryModal');
  const imageModal = $('#imageModal');

  $('#year').textContent = new Date().getFullYear();
  const toggle = $('.menu-toggle'); const nav = $('.main-nav');
  toggle.addEventListener('click', () => { const open = nav.classList.toggle('open'); toggle.setAttribute('aria-expanded', open); document.body.classList.toggle('menu-open', open); });
  $$('.main-nav a').forEach(link => link.addEventListener('click', () => { nav.classList.remove('open'); toggle.setAttribute('aria-expanded', 'false'); document.body.classList.remove('menu-open'); }));

  const setModalOpen = (modal, open) => { modal.classList.toggle('active', open); modal.setAttribute('aria-hidden', !open); document.body.classList.toggle('modal-open', open); };
  const openEnquiry = (button) => {
    const form = $('#modalForm'); const intent = button.dataset.intent || 'enquiry'; const configField = $('[name="configuration"]', form);
    if (config.googleFormUrl) {
      let embed = $('.google-form-embed', enquiryModal);
      if (!embed) {
        embed = document.createElement('div');
        embed.className = 'google-form-embed';
        embed.innerHTML = '<iframe title="Risland Sky Mansion enquiry form" loading="lazy" referrerpolicy="strict-origin-when-cross-origin"></iframe>';
        $('.modal-panel', enquiryModal).append(embed);
      }
      $('iframe', embed).src = config.googleFormUrl;
      form.hidden = true;
      $('#modalTitle').textContent = 'Make an enquiry';
      $('.modal-intro', enquiryModal).textContent = 'Please complete the form below and our relationship team will connect with you.';
      setModalOpen(enquiryModal, true);
      return;
    }
    form.hidden = false;
    $('[name="source"]', form).value = button.dataset.source || 'General enquiry';
    $('[name="intent"]', form).value = intent;
    $('[name="redirect_file"]', form).value = intent === 'brochure' ? config.brochureUrl : '';
    configField.value = button.dataset.configuration || '';
    $('#modalTitle').textContent = intent === 'brochure' ? 'Get the digital brochure' : intent === 'masterplan' ? 'Request the master plan' : button.dataset.configuration ? `Enquire about ${button.dataset.configuration}` : 'Make an enquiry';
    $('.modal-intro', enquiryModal).textContent = intent === 'brochure' ? 'Share your details to request the digital brochure.' : 'Leave your details and our relationship team will connect with you.';
    $('.form-feedback', form).textContent = '';
    setModalOpen(enquiryModal, true); setTimeout(() => $('[name="name"]', form).focus(), 120);
  };
  $$('.js-enquire').forEach(button => button.addEventListener('click', () => openEnquiry(button)));
  $$('.modal-close').forEach(button => button.addEventListener('click', () => setModalOpen(button.closest('.modal'), false)));
  $$('.modal').forEach(modal => modal.addEventListener('click', event => { if (event.target === modal) setModalOpen(modal, false); }));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') $$('.modal.active').forEach(m => setModalOpen(m, false)); });

  $$('.js-image').forEach(item => item.addEventListener('click', () => { const image = $('img', imageModal); image.src = item.dataset.image; image.alt = item.dataset.title || ''; $('p', imageModal).textContent = item.dataset.title || ''; setModalOpen(imageModal, true); }));

  function feedback(form, text, state = '') { const target = $('.form-feedback', form); target.textContent = text; target.className = `form-feedback ${state}`; }
  function validate(form) {
    const name = form.elements.name.value.trim(); const mobile = form.elements.mobile.value.replace(/\D/g, ''); const email = form.elements.email.value.trim();
    if (name.length < 2) return 'Please enter your full name.';
    if (!/^[6-9]\d{9}$/.test(mobile)) return 'Please enter a valid 10-digit Indian mobile number.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Please enter a valid email address.';
    if (!form.elements.consent.checked) return 'Please provide consent before submitting.';
    return '';
  }
  async function submitEnquiry(event) {
    event.preventDefault(); const form = event.currentTarget; if (form.dataset.submitting === 'true') return;
    if (config.googleFormUrl) {
      openEnquiry({ dataset: { source: form.elements.source?.value || 'Contact section' } });
      return;
    }
    const error = validate(form); if (error) { feedback(form, error, 'error'); return; }
    // Do not simulate submissions: an authorised endpoint is mandatory.
    if (!config.endpoint) { feedback(form, 'Lead submission is not configured yet. Please contact the project team directly at +91 89259 97082.', 'error'); return; }
    form.dataset.submitting = 'true'; const button = $('.form-submit', form); button.disabled = true; const original = button.innerHTML; button.textContent = 'Submitting…'; feedback(form, '');
    const data = new FormData(); const source = new FormData(form);
    Object.entries(config.fieldMap || {}).forEach(([local, remote]) => data.append(remote, source.get(local) || ''));
    data.append('intent', source.get('intent') || 'enquiry'); data.append('consent', 'true');
    try {
      const response = await fetch(config.endpoint, { method: config.method || 'POST', body: data, credentials: 'omit' });
      if (!response.ok) throw new Error(`Request failed (${response.status})`);
      feedback(form, config.successMessage || 'Thank you. Your enquiry has been received.', 'success'); form.reset();
      if (source.get('intent') === 'brochure' && config.brochureUrl) window.open(config.brochureUrl, '_blank', 'noopener');
    } catch (err) { feedback(form, 'We could not submit your enquiry. Please try again or call us directly.', 'error'); }
    finally { form.dataset.submitting = 'false'; button.disabled = false; button.innerHTML = original; }
  }
  $$('.enquiry-form').forEach(form => form.addEventListener('submit', submitEnquiry));
  const observer = new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); } }), { threshold: .12 });
  $$('.reveal').forEach(el => observer.observe(el));
})();
