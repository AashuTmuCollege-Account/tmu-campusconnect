/**
 * TMU CampusConnect - Website Embed Script
 * Teerthanker Mahaveer University AI Chatbot
 *
 * HOW TO EMBED ON YOUR UNIVERSITY WEBSITE:
 * Add this single line anywhere in your website's HTML, before </body>:
 *
 *   <script src="http://<YOUR-SERVER-IP>:8000/widget/embed.js"></script>
 *
 * The chatbot floating button will automatically appear on every page.
 * The server URL is detected automatically — no editing needed!
 */

(function() {
  // Auto-detect the server URL from this script's own src attribute.
  // This works whether the server is localhost, an IP, or a domain — no editing needed!
  const scriptSrc = (document.currentScript || {}).src || '';
  const SERVER = scriptSrc ? new URL(scriptSrc).origin : window.location.origin;

  // Inject styles
  const style = document.createElement('style');
  style.textContent = `
    #uni-chat-fab {
      position: fixed; bottom: 24px; right: 24px; z-index: 99999;
      width: 60px; height: 60px; border-radius: 50%;
      background: linear-gradient(135deg, #3b82f6, #8b5cf6);
      border: none; cursor: pointer; box-shadow: 0 4px 24px rgba(59,130,246,0.5);
      font-size: 28px; display: flex; align-items: center; justify-content: center;
      transition: all 0.3s; animation: fabPulse 2s ease-in-out infinite;
    }
    #uni-chat-fab:hover { transform: scale(1.1); box-shadow: 0 6px 32px rgba(59,130,246,0.7); }
    @keyframes fabPulse {
      0%, 100% { box-shadow: 0 4px 24px rgba(59,130,246,0.5); }
      50%       { box-shadow: 0 4px 32px rgba(59,130,246,0.8); }
    }
    #uni-chat-frame-wrap {
      position: fixed; bottom: 100px; right: 24px; z-index: 99998;
      width: 380px; height: 560px;
      border-radius: 16px; overflow: hidden;
      box-shadow: 0 20px 60px rgba(0,0,0,0.5);
      transform: scale(0.8) translateY(20px);
      opacity: 0; pointer-events: none;
      transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    #uni-chat-frame-wrap.open {
      transform: scale(1) translateY(0);
      opacity: 1; pointer-events: all;
    }
    #uni-chat-iframe {
      width: 100%; height: 100%; border: none;
    }
    @media (max-width: 480px) {
      #uni-chat-frame-wrap { width: calc(100vw - 20px); right: 10px; bottom: 90px; }
    }
  `;
  document.head.appendChild(style);

  // Create FAB button
  const fab = document.createElement('button');
  fab.id = 'uni-chat-fab';
  fab.title = 'TMU CampusConnect';
  fab.innerHTML = '🎓';
  document.body.appendChild(fab);

  // Create iframe wrapper
  const wrap = document.createElement('div');
  wrap.id = 'uni-chat-frame-wrap';
  const iframe = document.createElement('iframe');
  iframe.id = 'uni-chat-iframe';
  iframe.src = `${SERVER}/widget/`;
  iframe.allow = 'microphone';
  iframe.title = 'TMU CampusConnect AI Assistant';
  wrap.appendChild(iframe);
  document.body.appendChild(wrap);

  // Toggle chat
  let isOpen = false;
  fab.addEventListener('click', () => {
    isOpen = !isOpen;
    wrap.classList.toggle('open', isOpen);
    fab.innerHTML = isOpen ? '✕' : '🎓';
  });
})();
