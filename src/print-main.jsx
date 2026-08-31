import { createRoot } from 'react-dom/client';
import PrintApp from './print-app.jsx';
import './styles.css';
import './print.css';

createRoot(document.getElementById('root')).render(<PrintApp />);

/* Auto-print once fonts and images have settled. */
window.addEventListener('load', async () => {
  try {
    await document.fonts.ready;
  } catch {
    // Font loading is best-effort; printing should not depend on it.
  }

  // Wait for images so pages don't print half-empty.
  const images = Array.from(document.images);
  await Promise.all(
    images.map((img) =>
      img.complete
        ? null
        : new Promise((res) => {
            img.addEventListener('load', res, { once: true });
            img.addEventListener('error', res, { once: true });
            setTimeout(res, 4000);
          })
    )
  );

  // Settle for layout.
  setTimeout(() => window.print(), 800);
});
