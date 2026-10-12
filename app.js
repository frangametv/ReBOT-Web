'use strict';

document.querySelectorAll('[data-link]').forEach(link => {
  const value = window.REBOT?.[link.dataset.link];
  if (value) link.href = value;
});
document.querySelectorAll('[data-year]').forEach(element => { element.textContent = new Date().getFullYear(); });

// Mobile navigation: also usable with a keyboard and dismissed with Escape.
const menu = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#navigation');
function closeMenu(returnFocus = false) {
  menu?.setAttribute('aria-expanded', 'false');
  menu?.setAttribute('aria-label', 'Open menu');
  navigation?.classList.remove('is-open');
  if (returnFocus) menu?.focus();
}
menu?.addEventListener('click', () => {
  const open = menu.getAttribute('aria-expanded') !== 'true';
  menu.setAttribute('aria-expanded', String(open));
  menu.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  navigation.classList.toggle('is-open', open);
});
navigation?.querySelectorAll('a').forEach(link => link.addEventListener('click', () => closeMenu()));
document.addEventListener('keydown', event => { if (event.key === 'Escape' && menu?.getAttribute('aria-expanded') === 'true') closeMenu(true); });
document.addEventListener('click', event => { if (!event.target.closest('.site-header')) closeMenu(); });
matchMedia('(min-width: 851px)').addEventListener('change', event => { if (event.matches) closeMenu(); });

// Keep the supplied flat artwork intact; only its surrounding plane is rotated.
const motionPreference = matchMedia('(prefers-reduced-motion: reduce)');
document.querySelectorAll('.logo-stage').forEach(stage => {
  const plane = stage.querySelector('.logo-tilt');
  let frame;
  stage.addEventListener('pointermove', event => {
    if (motionPreference.matches || event.pointerType === 'touch') return;
    const box = stage.getBoundingClientRect();
    const x = (event.clientX - box.left) / box.width - .5;
    const y = (event.clientY - box.top) / box.height - .5;
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => { plane.style.transform = `rotateX(${-y * 15}deg) rotateY(${x * 19}deg) translateZ(12px)`; });
  });
  const reset = () => { cancelAnimationFrame(frame); plane.style.transform = ''; };
  stage.addEventListener('pointerleave', reset);
  stage.addEventListener('pointercancel', reset);
  motionPreference.addEventListener('change', reset);
});

const examples = {
  cash: { input: '/cash', kicker: 'WALLET', title: 'Your balance.', value: '2,450', unit: 'Cash', description: 'How much Cash is in your wallet right now.', hint: 'Use /cash in your server to see your real balance.' },
  daily: { input: '/daily', kicker: 'DAILY REWARD', title: 'Daily reward claimed.', value: '+100', unit: 'Cash', description: 'An example of a starting-level daily reward. Claim it every 24 hours; the amount depends on your community level.', hint: 'Use /daily in your server to claim your reward.' },
  work: { input: '/work', kicker: 'WORK', title: 'Work reward claimed.', value: '+3', unit: 'Cash', description: 'Example with 2,450 Cash and a work factor of 800. The reward depends on your balance and server settings. Come back after 30 minutes.', hint: 'Use /work in your server to get started.' },
  bank: { input: '/bank generate', kicker: 'BANK', title: 'Account created.', value: 'Your', unit: 'account', description: 'Create an account and receive its access code in a direct message. Keep it safe and private.', hint: 'Use /bank to create an account, check it, and manage your Cash.' },
  pay: { input: '/pay user: @friend amount: 100', kicker: 'TRANSFER', title: 'Cash sent.', value: '100', unit: 'Cash', description: 'An example of a transfer from your wallet to another server member.', hint: 'Choose a recipient and amount with /pay on Discord.' },
  slot: { input: '/slot amount: 50', kicker: 'SLOTS', title: 'Bet placed.', value: '50', unit: 'Cash at stake', description: 'An example bet using virtual currency: you can win or lose the Cash you stake.', hint: 'Use /slot on Discord to choose your bet.' }
};
const tabs = [...document.querySelectorAll('[data-command]')];
function selectCommand(tab) {
  const example = examples[tab.dataset.command];
  tabs.forEach(item => { const active = item === tab; item.setAttribute('aria-selected', String(active)); item.tabIndex = active ? 0 : -1; });
  document.querySelector('#command-panel').setAttribute('aria-labelledby', tab.id);
  ['input', 'kicker', 'title', 'description', 'hint'].forEach(key => { document.querySelector(`#demo-${key}`).textContent = example[key]; });
  const value = document.querySelector('#demo-value');
  const unit = document.createElement('span'); unit.textContent = example.unit;
  value.replaceChildren(document.createTextNode(`${example.value} `), unit);
}
tabs.forEach((tab, index) => {
  tab.addEventListener('click', () => selectCommand(tab));
  tab.addEventListener('keydown', event => {
    const offsets = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 };
    let next;
    if (event.key in offsets) next = (index + offsets[event.key] + tabs.length) % tabs.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = tabs.length - 1;
    else return;
    event.preventDefault(); selectCommand(tabs[next]); tabs[next].focus();
  });
});
const compactCommands = matchMedia('(max-width: 600px)');
function orientTabs() { document.querySelector('[role="tablist"]')?.setAttribute('aria-orientation', compactCommands.matches ? 'horizontal' : 'vertical'); }
compactCommands.addEventListener('change', orientTabs); orientTabs();

document.querySelectorAll('[data-event]').forEach(button => button.addEventListener('click', () => {
  const joined = button.dataset.event === 'join';
  document.querySelectorAll('[data-event]').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
  document.querySelector('.reward-display').classList.toggle('is-leave', !joined);
  document.querySelector('#reward-caption').textContent = joined ? 'NEW ELIGIBLE INVITE' : 'INVITED MEMBER LEFT';
  document.querySelector('#reward-number').textContent = joined ? '+1,000' : '−900';
  document.querySelector('#reward-detail').textContent = joined ? 'Reward for an eligible invite.' : 'The reward is removed from the inviter’s balance.';
  document.querySelector('#reward-command').textContent = joined ? '/joinchannel' : '/leavechannel';
}));

document.querySelector('.copy-request')?.addEventListener('click', async () => {
  const template = document.querySelector('.request-template');
  const status = document.querySelector('.copy-status');
  try {
    if (!navigator.clipboard) throw new Error('Clipboard unavailable');
    await navigator.clipboard.writeText(template.textContent.trim());
    status.textContent = 'Request copied. Fill in your information before sending it to support.';
  } catch {
    template.hidden = false;
    status.textContent = 'Select and copy the template below.';
  }
});

if ('IntersectionObserver' in window) {
  if (!motionPreference.matches) {
    document.documentElement.classList.add('motion-ready');
    const revealObserver = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('visible'); revealObserver.unobserve(entry.target); }
    }), { threshold: .08 });
    document.querySelectorAll('.reveal').forEach(element => revealObserver.observe(element));
  }
  const policyObserver = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) document.querySelectorAll('.policy-nav a[href^="#"]').forEach(link => {
      const current = link.hash === `#${entry.target.id}`;
      link.classList.toggle('current', current);
      if (current) link.setAttribute('aria-current', 'location'); else link.removeAttribute('aria-current');
    });
  }), { rootMargin: '-5% 0px -65% 0px', threshold: 0 });
  document.querySelectorAll('.policy-section').forEach(element => policyObserver.observe(element));
}
