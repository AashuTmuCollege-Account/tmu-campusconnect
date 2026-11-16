// ==UserScript==
// @name         TMU Chatbot Widget
// @namespace    https://portal2.tmu.ac.in/
// @version      1.1.0
// @description  Adds the TMU AI Assistant chat bubble on the left side of the university portal
// @author       TMU Admin
// @match        https://portal2.tmu.ac.in/*
// @match        http://portal2.tmu.ac.in/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function () {
  'use strict';

  // ──────────────────────────────────────────────────────────────
  //  CONFIGURATION — Change SERVER to your chatbot backend address
  // ──────────────────────────────────────────────────────────────
  const CONFIG = {
    // ✅ Using ngrok public URL so the widget works on ALL devices
    //    (mobile, tablet, other PCs) — not just this PC.
    // If you restart ngrok and get a new URL, update this line.
    SERVER: 'https://unstuffed-flyover-answering.ngrok-free.dev',

    BOT_NAME:     'CAMPUS CONNECT',
    BOT_SUBTITLE: 'Teerthanker Mahaveer University',
    LOGO_URL:     'https://portal2.tmu.ac.in/rightlogo.png',
    COLORS: {
      primary:   '#FFB106',   // TMU amber/orange (matches the portal header)
      secondary: '#2FBDF1',   // TMU sky blue (matches modal headers)
      accent:    '#e65c00',   // Darker orange for notification dot
    },
    WINDOW_WIDTH:  '400px',
    WINDOW_HEIGHT: '560px',
  };
  // ──────────────────────────────────────────────────────────────

  // Avoid double-injection
  if (document.getElementById('tmu-chat-root')) return;

  // ── Inject CSS ──────────────────────────────────────────────
  const style = document.createElement('style');
  style.id = 'tmu-chat-styles';
  style.textContent = `
    #tmu-chat-root {
      position: fixed;
      left: 0px;
      top: 50%;
      transform: translateY(-50%);
      z-index: 2147483647;
      display: flex;
      flex-direction: row;
      align-items: center;
      gap: 0;
    }

    #tmu-chat-tab {
      position: relative;
      width: 48px;
      height: 130px;
      background: linear-gradient(180deg, ${CONFIG.COLORS.primary} 0%, #e6960a 50%, ${CONFIG.COLORS.secondary} 100%);
      border: none;
      border-radius: 0 12px 12px 0;
      cursor: pointer;
      box-shadow: 4px 0 20px rgba(37,99,235,0.45), 2px 0 8px rgba(0,0,0,0.3);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 0 0 0 2px;
      transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
      outline: none;
      overflow: hidden;
    }
    #tmu-chat-tab::before {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(135deg, rgba(255,255,255,0.18), transparent);
      border-radius: inherit;
      pointer-events: none;
    }
    #tmu-chat-tab:hover {
      width: 56px;
      box-shadow: 6px 0 28px rgba(37,99,235,0.65);
    }
    #tmu-chat-tab:hover #tmu-chat-icon { transform: scale(1.08); }

    /* Logo image inside tab */
    #tmu-chat-logo {
      width: 32px; height: 32px;
      border-radius: 50%;
      object-fit: contain;
      background: #fff;
      padding: 2px;
      box-shadow: 0 0 0 1px rgba(255,255,255,0.3);
      display: block;
      transition: transform 0.3s ease;
    }
    #tmu-chat-tab:hover #tmu-chat-logo { transform: scale(1.1) rotate(-5deg); }

    /* Pulse ring */
    #tmu-chat-tab::after {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: inherit;
      background: rgba(255,255,255,0.1);
      animation: tmuPulse 2.5s ease-in-out infinite;
      pointer-events: none;
    }
    @keyframes tmuPulse {
      0%,100% { opacity:0; transform:scale(1); }
      50%      { opacity:1; transform:scale(1.06); }
    }

    #tmu-chat-icon {
      font-size: 24px;
      line-height: 1;
      transition: transform 0.3s ease;
      filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
      color: #fff;
    }
    #tmu-chat-vtext {
      writing-mode: vertical-rl;
      text-orientation: mixed;
      transform: rotate(180deg);
      color: rgba(255,255,255,0.9);
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 0.08em;
      white-space: nowrap;
      text-shadow: 0 1px 3px rgba(0,0,0,0.4);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    }
    #tmu-chat-notif {
      position: absolute;
      top: 8px; right: 6px;
      width: 10px; height: 10px;
      background: ${CONFIG.COLORS.accent};
      border-radius: 50%;
      border: 2px solid #fff;
      display: none;
      animation: tmuBounce 1s ease-in-out infinite;
    }
    @keyframes tmuBounce {
      0%,100% { transform:scale(1); }
      50%      { transform:scale(1.35); }
    }

    /* Chat window */
    #tmu-chat-window {
      width: ${CONFIG.WINDOW_WIDTH};
      height: ${CONFIG.WINDOW_HEIGHT};
      border-radius: 0 16px 16px 0;
      overflow: hidden;
      box-shadow: 10px 0 40px rgba(0,0,0,0.55), 2px 0 12px rgba(37,99,235,0.3);
      border: 1px solid rgba(255,255,255,0.12);
      border-left: none;
      transform-origin: left center;
      transform: scaleX(0);
      opacity: 0;
      pointer-events: none;
      transition: transform 0.35s cubic-bezier(0.34,1.56,0.64,1),
                  opacity  0.25s ease;
    }
    #tmu-chat-window.tmu-open {
      transform: scaleX(1);
      opacity: 1;
      pointer-events: all;
    }
    #tmu-chat-iframe {
      width: 100%; height: 100%;
      border: none; display: block;
    }

    /* Tooltip */
    #tmu-chat-tip {
      position: absolute;
      left: 58px; top: 50%;
      transform: translateY(-50%);
      background: rgba(15,23,42,0.97);
      color: #fff;
      padding: 8px 14px;
      border-radius: 8px;
      font-size: 13px; font-weight: 500;
      white-space: nowrap;
      pointer-events: none;
      opacity: 0;
      transition: opacity 0.2s;
      border: 1px solid rgba(255,255,255,0.15);
      box-shadow: 0 4px 16px rgba(0,0,0,0.4);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    }
    #tmu-chat-tip::before {
      content: '';
      position: absolute;
      left: -6px; top: 50%;
      transform: translateY(-50%);
      border: 6px solid transparent;
      border-right-color: rgba(15,23,42,0.97);
      border-left: none;
    }
    #tmu-chat-root:hover:not(.tmu-expanded) #tmu-chat-tip { opacity: 1; }

    @media (max-width: 600px) {
      #tmu-chat-root { top:auto; bottom:16px; transform:none; }
      #tmu-chat-tab  { height:80px; }
      #tmu-chat-vtext { display:none; }
      #tmu-chat-window {
        position:fixed; bottom:108px; left:0;
        width:calc(100vw - 10px); max-width:420px;
        height:70vh;
      }
    }
  `;
  document.head.appendChild(style);

  // ── Build DOM ───────────────────────────────────────────────
  const root = document.createElement('div');
  root.id = 'tmu-chat-root';

  const tab = document.createElement('button');
  tab.id = 'tmu-chat-tab';
  tab.setAttribute('aria-label', `Open ${CONFIG.BOT_NAME}`);

  const iconEl   = document.createElement('img');
  iconEl.id  = 'tmu-chat-logo';
  iconEl.src = CONFIG.LOGO_URL;
  iconEl.alt = 'TMU';
  iconEl.onerror = () => { iconEl.style.display='none'; };
  const vtextEl  = document.createElement('span'); vtextEl.id = 'tmu-chat-vtext'; vtextEl.textContent = 'Chat with Us';
  const notifEl  = document.createElement('span'); notifEl.id = 'tmu-chat-notif';
  tab.append(iconEl, vtextEl, notifEl);

  const tipEl = document.createElement('div');
  tipEl.id = 'tmu-chat-tip';
  tipEl.textContent = `Ask CAMPUS CONNECT anything!`;

  const win = document.createElement('div');
  win.id = 'tmu-chat-window';
  win.setAttribute('aria-hidden', 'true');

  const iframe = document.createElement('iframe');
  iframe.id = 'tmu-chat-iframe';
  // Bypass ngrok interstitial warning page inside iframe
  const _iframeUrl = new URL(`${CONFIG.SERVER}/widget/`);
  if (CONFIG.SERVER.includes('ngrok')) {
    _iframeUrl.searchParams.set('ngrok-skip-browser-warning', 'true');
  }
  iframe.src = _iframeUrl.toString();
  iframe.allow = 'microphone';
  iframe.title = CONFIG.BOT_NAME;
  win.appendChild(iframe);


  root.append(tab, win, tipEl);
  document.body.appendChild(root);

  // ── Toggle ──────────────────────────────────────────────────
  let open = false;

  function openChat() {
    open = true;
    win.classList.add('tmu-open');
    win.setAttribute('aria-hidden', 'false');
    root.classList.add('tmu-expanded');
    iconEl.style.display = 'none';
    const xEl = document.createElement('span');
    xEl.id = 'tmu-close-x';
    xEl.textContent = '✕';
    xEl.style.cssText = 'font-size:18px;color:#fff;font-weight:bold;';
    iconEl.parentElement.insertBefore(xEl, iconEl);
    vtextEl.textContent = 'Close';
    notifEl.style.display = 'none';
    tipEl.textContent = 'Click to close';
    tab.setAttribute('aria-label', `Close CAMPUS CONNECT`);
  }

  function closeChat() {
    open = false;
    win.classList.remove('tmu-open');
    win.setAttribute('aria-hidden', 'true');
    root.classList.remove('tmu-expanded');
    const closeX = document.getElementById('tmu-close-x');
    if (closeX) closeX.remove();
    iconEl.style.display = 'block';
    vtextEl.textContent = 'Chat with Us';
    tipEl.textContent = `Ask CAMPUS CONNECT anything!`;
    tab.setAttribute('aria-label', `Open CAMPUS CONNECT`);
  }

  tab.addEventListener('click', () => open ? closeChat() : openChat());
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && open) closeChat(); });

  // Show notification dot after 3 seconds
  setTimeout(() => { if (!open) notifEl.style.display = 'block'; }, 3000);

})();
