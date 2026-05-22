# Supervision avec Grafana Cloud

Ce document explique la configuration de la supervision implémentée dans l'application via Grafana Cloud. Nous avons mis en place à la fois la supervision frontend des utilisateurs réels (RUM) et le traçage backend.

## 1. Supervision Frontend (Grafana Faro)

Nous avons intégré le **Grafana Faro Web SDK** pour collecter la télémétrie frontend, comme les erreurs, les web vitals et les sessions utilisateurs.

- **Initialisation** : Le récepteur Faro est initialisé dans `src/main.tsx`.
- **Configuration** : Il envoie les données à l'URL du endpoint Grafana Faro.
- **Instrumentations** : Il capture les instrumentations web standards et inclut `TracingInstrumentation` pour une visibilité de bout en bout des requêtes HTTP effectuées par le frontend.

## 2. Traçage Backend (OpenTelemetry)

Nous avons configuré **OpenTelemetry** sur le backend pour capturer les traces et les exporter vers Grafana Cloud.

- **Initialisation** : La configuration se trouve dans `instrument.ts`, qui est importé tout en haut de `server.ts`.
- **Node SDK** : Il utilise `@opentelemetry/sdk-node` avec les auto-instrumentations pour Node.js (`@opentelemetry/auto-instrumentations-node`) pour capturer automatiquement les traces des modules comme Express et HTTP.
- **Exportateur** : Les traces sont exportées via HTTP en utilisant `OTLPTraceExporter` (`@opentelemetry/exporter-trace-otlp-http`).
- **Configuration** : L'exportateur s'appuie sur les variables d'environnement standards d'OpenTelemetry (`OTEL_EXPORTER_OTLP_ENDPOINT` et `OTEL_EXPORTER_OTLP_HEADERS`) pour s'authentifier et router les traces vers votre instance Grafana Cloud spécifique.

## 3. Variables d'Environnement Utilisées

Pour que cela fonctionne de manière sécurisée, les variables d'environnement suivantes sont utilisées (et leurs structures sont indiquées dans `.env.example`) :

- **`OTEL_EXPORTER_OTLP_ENDPOINT`** : L'URL du endpoint pour la passerelle OpenTelemetry (par exemple, `https://otlp-gateway-prod-us-east-2.grafana.net/otlp`).
- **`OTEL_EXPORTER_OTLP_HEADERS`** : Le jeton d'autorisation au format `Authorization=Basic <base64_encoded_token>`. Cela garantit que les traces backend sont poussées en toute sécurité vers votre endpoint OpenTelemetry Grafana Cloud.

_Note : Si `OTEL_EXPORTER_OTLP_ENDPOINT` et `OTEL_EXPORTER_OTLP_HEADERS` ne sont pas définis dans vos variables d'environnement secrètes, l'initialisation du traçage backend sera simplement ignorée pour éviter les plantages lors de l'exécution._
