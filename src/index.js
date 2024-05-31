import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import { RecoilRoot } from 'recoil';

// 서비스 워커 시작
async function enableMocking() {
  if (process.env.NODE_ENV !== 'development') {
    return;
  }

  const { worker } = await import('./mocks/browser');

  // `worker.start()` returns a Promise that resolves
  // once the Service Worker is up and ready to intercept requests.
  return worker.start();
}

const root = ReactDOM.createRoot(document.getElementById('root'));

enableMocking().then(() => {
  root.render(
    <BrowserRouter basename={process.env.PUBLIC_URL}>
      <RecoilRoot>
        <App />
      </RecoilRoot>
    </BrowserRouter>,
  );
});
