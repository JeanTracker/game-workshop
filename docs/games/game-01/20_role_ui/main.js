document.addEventListener('DOMContentLoaded', () => {
  const btn = document.querySelector('.btn');
  if (!btn) return;
  btn.addEventListener('focus', () => {
    btn.setAttribute('aria-live', 'polite');
  });
});
