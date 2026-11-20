/*
 * Lead integration lives here. This project folder contained no existing API,
 * CRM handler, or authorised destination. Set endpoint and fieldMap once the
 * approved destination is supplied. A successful message is never shown until
 * that endpoint replies successfully.
 */
window.ENQUIRY_CONFIG = {
  // Public Google Form connected to the project's lead sheet. This is shown
  // for every enquiry CTA so submissions go through the authorised form.
  googleFormUrl: 'https://docs.google.com/forms/d/e/1FAIpQLScGF17qSrZb1Ooz_1Zss6f4rpEa2W0BPXigD9EicC2MG9y5yw/viewform?embedded=true',
  endpoint: '', // e.g. 'https://your-authorised-domain.example/lead'
  method: 'POST',
  fieldMap: { name: 'name', mobile: 'mobile', email: 'email', message: 'query', configuration: 'configuration', source: 'source', project: 'project' },
  // Only configure this once a trusted brochure URL is supplied.
  brochureUrl: '',
  successMessage: 'Thank you. Your enquiry has been received.'
};
