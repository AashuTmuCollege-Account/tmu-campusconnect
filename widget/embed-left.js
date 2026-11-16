/**
 * University Chatbot - Left Side Embed Script
 * ─────────────────────────────────────────────
 * HOW TO INJECT INTO portal2.tmu.ac.in:
 *
 *  Option 1 – Bookmarklet (paste in browser console or bookmark):
 *    Copy the minified version below and paste in your browser console
 *    while on the portal page.
 *
 *  Option 2 – Tampermonkey Userscript (recommended for persistent use):
 *    Create a new userscript in Tampermonkey and paste the full file
 *    with @match https://portal2.tmu.ac.in/*
 *
 *  Option 3 – If you have access to inject HTML into the portal:
 *    <script src="http://<YOUR-SERVER-IP>:8000/widget/embed-left.js"></script>
 *
 * Change SERVER below to your chatbot backend URL (or ngrok URL).
 */

(function () {
  'use strict';

  // ──────────────────────────────────────────────────────────────
  // CONFIGURATION — Update these values
  // ──────────────────────────────────────────────────────────────
  const CONFIG = {
    SERVER:       'http://localhost:8000',   // Your chatbot server URL (or ngrok)
    BOT_NAME:     'TMU Assistant',           // Bot name shown in chat header
    BOT_SUBTITLE: 'Teerthanker Mahaveer University', // Subtitle
    ICON_EMOJI:   '🎓',                      // Icon shown on the button
    // Position: left side, vertically centered
    POSITION: {
      side: 'left',
      offset: '0px',         // Distance from the left edge
      top: '50%',            // Vertical position (50% = center)
    },
    // Colors — matches TMU's blue accent palette
    COLORS: {
      primary:    '#FFB106',   // TMU amber (matches portal header)
      secondary:  '#2FBDF1',   // TMU sky blue (matches portal modals)
      accent:     '#e65c00',   // Dark orange for notification dot
      text:       '#ffffff',
    },
    WIDTH:  '400px',           // Chat window width
    HEIGHT: '560px',           // Chat window height
  };
  // ──────────────────────────────────────────────────────────────

  // Prevent double-injection
  if (document.getElementById('tmu-chat-root')) return;

  // ── 1. Inject Styles ──────────────────────────────────────────
  const style = document.createElement('style');
  style.id = 'tmu-chat-styles';
  style.textContent = `
    /* Root container */
    #tmu-chat-root {
      position: fixed;
      left: ${CONFIG.POSITION.offset};
      top: ${CONFIG.POSITION.top};
      transform: translateY(-50%);
      z-index: 2147483647;
      display: flex;
      flex-direction: row;
      align-items: center;
      gap: 0;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    }

    /* ── Floating Tab Button ── */
    #tmu-chat-tab {
      position: relative;
      width: 48px;
      height: 130px;
      background: linear-gradient(180deg, ${CONFIG.COLORS.primary}, ${CONFIG.COLORS.secondary});
      border: none;
      border-radius: 0 12px 12px 0;
      cursor: pointer;
      box-shadow: 4px 0 20px rgba(37,99,235,0.4), 2px 0 8px rgba(0,0,0,0.3);
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
      top: 0; left: 0; right: 0; bottom: 0;
      background: linear-gradient(135deg, rgba(255,255,255,0.15), transparent);
      border-radius: inherit;
      pointer-events: none;
    }

    #tmu-chat-tab:hover {
      width: 56px;
      box-shadow: 6px 0 28px rgba(37,99,235,0.6), 2px 0 12px rgba(0,0,0,0.4);
    }

    #tmu-chat-tab:hover #tmu-chat-tab-icon {
      transform: scale(1.15) rotate(-5deg);
    }

    /* Pulse animation ring */
    #tmu-chat-tab::after {
      content: '';
      position: absolute;
      top: 50%; left: 50%;
      transform: translate(-50%, -50%);
      width: 100%; height: 100%;
      border-radius: inherit;
      background: rgba(255,255,255,0.1);
      animation: tmuTabPulse 2.5s ease-in-out infinite;
      pointer-events: none;
    }

    @keyframes tmuTabPulse {
      0%, 100% { opacity: 0; transform: translate(-50%, -50%) scale(1); }
      50%       { opacity: 1; transform: translate(-50%, -50%) scale(1.05); }
    }

    /* Icon inside button */
    #tmu-chat-tab-icon {
      font-size: 24px;
      transition: transform 0.3s ease;
      filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
      line-height: 1;
    }

    /* Rotated label text */
    #tmu-chat-tab-label {
      writing-mode: vertical-rl;
      text-orientation: mixed;
      transform: rotate(180deg);
      color: #fff;
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 0.08em;
      opacity: 0.9;
      white-space: nowrap;
      text-shadow: 0 1px 3px rgba(0,0,0,0.4);
      font-family: inherit;
    }

    /* Notification dot */
    #tmu-chat-notif {
      position: absolute;
      top: 8px;
      right: 6px;
      width: 10px;
      height: 10px;
      background: ${CONFIG.COLORS.accent};
      border-radius: 50%;
      border: 2px solid #fff;
      animation: tmuNotifBounce 1s ease-in-out infinite;
      display: none;
    }

    @keyframes tmuNotifBounce {
      0%, 100% { transform: scale(1); }
      50%       { transform: scale(1.3); }
    }

    /* ── Chat Window ── */
    #tmu-chat-window {
      width: ${CONFIG.WIDTH};
      height: ${CONFIG.HEIGHT};
      background: #0f172a;
      border-radius: 0 16px 16px 0;
      overflow: hidden;
      box-shadow: 8px 0 40px rgba(0,0,0,0.6), 2px 0 12px rgba(37,99,235,0.3);
      border: 1px solid rgba(255,255,255,0.1);
      border-left: none;
      transform-origin: left center;
      transform: scaleX(0);
      opacity: 0;
      pointer-events: none;
      transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1),
                  opacity 0.25s ease;
    }

    #tmu-chat-window.tmu-open {
      transform: scaleX(1);
      opacity: 1;
      pointer-events: all;
    }

    #tmu-chat-iframe {
      width: 100%;
      height: 100%;
      border: none;
      display: block;
    }

    /* ── Tooltip ── */
    #tmu-chat-tooltip {
      position: absolute;
      left: 58px;
      top: 50%;
      transform: translateY(-50%);
      background: rgba(15,23,42,0.95);
      color: #fff;
      padding: 8px 14px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 500;
      white-space: nowrap;
      pointer-events: none;
      opacity: 0;
      transition: opacity 0.2s;
      border: 1px solid rgba(255,255,255,0.15);
      box-shadow: 0 4px 16px rgba(0,0,0,0.4);
      z-index: 1;
    }

    #tmu-chat-tooltip::before {
      content: '';
      position: absolute;
      left: -6px;
      top: 50%;
      transform: translateY(-50%);
      border: 6px solid transparent;
      border-right-color: rgba(15,23,42,0.95);
      border-left: none;
    }

    #tmu-chat-root:hover #tmu-chat-tooltip {
      opacity: 1;
    }

    /* ── Mobile Responsive ── */
    @media (max-width: 600px) {
      #tmu-chat-root {
        top: auto;
        bottom: 20px;
        left: 0;
        transform: none;
      }

      #tmu-chat-tab {
        width: 48px;
        height: 80px;
        border-radius: 0 10px 10px 0;
      }

      #tmu-chat-tab-label { display: none; }

      #tmu-chat-window {
        position: fixed;
        bottom: 110px;
        left: 0;
        width: 100vw;
        max-width: 420px;
        height: 70vh;
        border-radius: 0 16px 16px 0;
        transform-origin: bottom left;
      }
    }
  `;
  document.head.appendChild(style);

  // ── 2. Create DOM Elements ────────────────────────────────────

  // Root wrapper
  const root = document.createElement('div');
  root.id = 'tmu-chat-root';

  // Tab button (left-side vertical pill)
  const tab = document.createElement('button');
  tab.id = 'tmu-chat-tab';
  tab.setAttribute('aria-label', 'Open University Chat Assistant');
  tab.setAttribute('title', CONFIG.BOT_NAME);

  const icon = document.createElement('span');
  icon.id = 'tmu-chat-tab-icon';
  icon.textContent = CONFIG.ICON_EMOJI;

  const label = document.createElement('span');
  label.id = 'tmu-chat-tab-label';
  label.textContent = 'Chat with Us';

  const notif = document.createElement('span');
  notif.id = 'tmu-chat-notif';

  tab.appendChild(icon);
  tab.appendChild(label);
  tab.appendChild(notif);

  // Tooltip
  const tooltip = document.createElement('div');
  tooltip.id = 'tmu-chat-tooltip';
  tooltip.textContent = `Ask ${CONFIG.BOT_NAME} anything!`;

  // Chat window (iframe)
  const chatWin = document.createElement('div');
  chatWin.id = 'tmu-chat-window';
  chatWin.setAttribute('aria-hidden', 'true');

  const iframe = document.createElement('iframe');
  iframe.id = 'tmu-chat-iframe';
  // Bypass ngrok interstitial warning page inside iframe
  const _widgetUrl = new URL(`${CONFIG.SERVER}/widget/`);
  if (CONFIG.SERVER.includes('ngrok')) {
    _widgetUrl.searchParams.set('ngrok-skip-browser-warning', 'true');
  }
  iframe.src = _widgetUrl.toString();
  iframe.allow = 'microphone';
  iframe.setAttribute('allowfullscreen', '');
  iframe.title = `${CONFIG.BOT_NAME} - University Assistant`;

  chatWin.appendChild(iframe);

  // Assemble root
  root.appendChild(tab);
  root.appendChild(chatWin);
  root.appendChild(tooltip);

  document.body.appendChild(root);

  // ── 3. Toggle Logic ──────────────────────────────────────────
  let isOpen = false;

  function openChat() {
    isOpen = true;
    chatWin.classList.add('tmu-open');
    chatWin.setAttribute('aria-hidden', 'false');
    icon.textContent = '✕';
    icon.style.fontSize = '20px';
    label.textContent = 'Close';
    notif.style.display = 'none'; // Hide notification dot on open
    tab.setAttribute('aria-label', 'Close University Chat');
    tooltip.textContent = 'Click to close';
  }

  function closeChat() {
    isOpen = false;
    chatWin.classList.remove('tmu-open');
    chatWin.setAttribute('aria-hidden', 'true');
    icon.textContent = CONFIG.ICON_EMOJI;
    icon.style.fontSize = '24px';
    label.textContent = 'Chat with Us';
    tab.setAttribute('aria-label', 'Open University Chat Assistant');
    tooltip.textContent = `Ask ${CONFIG.BOT_NAME} anything!`;
  }

  tab.addEventListener('click', () => {
    isOpen ? closeChat() : openChat();
  });

  // Close chat when pressing Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpen) closeChat();
  });

  // ── 4. Notification dot (shows after 3s to attract attention) ─
  setTimeout(() => {
    if (!isOpen) notif.style.display = 'block';
  }, 3000);

  console.log('[TMU Chat] Widget injected successfully. Server:', CONFIG.SERVER);

})();
