import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import * as dotenv from 'dotenv';

dotenv.config();

if (process.env.OTEL_EXPORTER_OTLP_ENDPOINT && process.env.OTEL_EXPORTER_OTLP_HEADERS) {
  // The OTLPTraceExporter automatically picks up OTEL_EXPORTER_OTLP_ENDPOINT and OTEL_EXPORTER_OTLP_HEADERS
  const traceExporter = new OTLPTraceExporter();

  const sdk = new NodeSDK({
    traceExporter,
    instrumentations: [getNodeAutoInstrumentations()],
    serviceName: 'DuoQ-backend',
  });

  sdk.start();
  console.log('Grafana OpenTelemetry Backend Tracing initialized.');

  process.on('SIGTERM', () => {
    sdk.shutdown()
      .then(() => console.log('Tracing terminated'))
      .catch((error) => console.log('Error terminating tracing', error))
      .finally(() => process.exit(0));
  });
}
