import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { getWebInstrumentations, initializeFaro } from '@grafana/faro-web-sdk';
import { TracingInstrumentation } from '@grafana/faro-web-tracing';
import App from './App.tsx';
import './index.css';

initializeFaro({
  url: 'https://faro-collector-prod-us-east-2.grafana.net/collect/f41fe8ce6b8b035b81787f5d2e731bc5',
  app: {
    name: 'DuoQ',
    version: '1.0.0',
    environment: 'production'
  },
  instrumentations: [
    ...getWebInstrumentations(),
    new TracingInstrumentation(),
  ],
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
