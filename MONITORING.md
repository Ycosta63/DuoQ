# Monitoring with Grafana Cloud

This document explains the monitoring setup implemented in the application using Grafana Cloud. We have established both frontend real-user monitoring (RUM) and backend tracing.

## 1. Frontend Monitoring (Grafana Faro)

We have integrated the **Grafana Faro Web SDK** to collect frontend telemetry, such as errors, web vitals, and user sessions.

- **Initialization**: The Faro receiver is initialized in `src/main.tsx`.
- **Configuration**: It sends data to the Grafana Faro endpoint URL.
- **Instrumentations**: It captures standard web instrumentations and includes `TracingInstrumentation` for end-to-end visibility of HTTP requests made by the frontend.

## 2. Backend Tracing (OpenTelemetry)

We have set up **OpenTelemetry** on the backend to capture traces and export them to Grafana Cloud.

- **Initialization**: The setup is located in `instrument.ts`, which is imported at the very top of `server.ts`.
- **Node SDK**: It uses `@opentelemetry/sdk-node` along with auto-instrumentations for Node.js (`@opentelemetry/auto-instrumentations-node`) to automatically capture traces from modules like Express and HTTP.
- **Exporter**: Traces are exported over HTTP using `OTLPTraceExporter` (`@opentelemetry/exporter-trace-otlp-http`).
- **Configuration**: The exporter relies on the standard OpenTelemetry environment variables (`OTEL_EXPORTER_OTLP_ENDPOINT` and `OTEL_EXPORTER_OTLP_HEADERS`) to authenticate and route the traces to your specific Grafana Cloud instance.

## 3. Environment Variables Used

To make this work securely, the following environment variables are utilized (and their structures are shown in `.env.example`):

- **`OTEL_EXPORTER_OTLP_ENDPOINT`**: The URL endpoint for the OpenTelemetry gateway (e.g., `https://otlp-gateway-prod-us-east-2.grafana.net/otlp`).
- **`OTEL_EXPORTER_OTLP_HEADERS`**: The authorization token in the format `Authorization=Basic <base64_encoded_token>`. This ensures the backend traces are securely pushed to your Grafana Cloud OpenTelemetry endpoint.

_Note: If `OTEL_EXPORTER_OTLP_ENDPOINT` and `OTEL_EXPORTER_OTLP_HEADERS` are not set in your secret environment variables, the backend tracing initialization will simply be skipped to avoid runtime crashes._
