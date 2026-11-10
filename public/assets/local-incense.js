(() => {
  const words = {
    'zh-CN': ['上香', '点一炷虚拟香，静坐片刻。', '点香', '已点燃一炷香', '关闭'],
    'zh-TW': ['上香', '點一炷虛擬香，靜坐片刻。', '點香', '已點燃一炷香', '關閉'],
    ko: ['향 올리기', '가상의 향을 켜고 잠시 쉬어 가세요.', '향 켜기', '향을 올렸어요', '닫기'],
    en: ['Light incense', 'Light a virtual incense stick and take a moment.', 'Light incense', 'Incense lit', 'Close'],
    ja: ['お香', '仮想のお香を焚いて、少し休みましょう。', 'お香を焚く', 'お香を焚きました', '閉じる'],
    es: ['Encender incienso', 'Enciende un incienso virtual y descansa un momento.', 'Encender', 'Incienso encendido', 'Cerrar'],
    'pt-BR': ['Acender incenso', 'Acenda um incenso virtual e descanse um pouco.', 'Acender', 'Incenso aceso', 'Fechar'],
  };
  const app = document.querySelector('#app');
  const mount = () => {
    const dialog = document.querySelector('#support-dialog');
    if (!dialog) return;
    observer.disconnect();
    const title = dialog.querySelector('#local-incense-title');
    const description = dialog.querySelector('#local-incense-description');
    const button = dialog.querySelector('#local-incense-light');
    const status = dialog.querySelector('#local-incense-status');
    const close = dialog.querySelector('.dialog-close');
    let lit = false;
    const render = () => {
      const copy = words[document.documentElement.lang] ?? words.en;
      [title.textContent, description.textContent, button.textContent] = copy;
      status.textContent = lit ? copy[3] : '';
      close.setAttribute('aria-label', copy[4]);
      dialog.classList.toggle('is-lit', lit);
    };
    button.addEventListener('click', () => {
      lit = true;
      render();
    });
    dialog.addEventListener('close', () => {
      lit = false;
      render();
    });
    window.addEventListener('cyber-sansa-lang', render);
    render();
  };
  const observer = new MutationObserver(mount);
  observer.observe(app, { childList: true });
  mount();
})();
