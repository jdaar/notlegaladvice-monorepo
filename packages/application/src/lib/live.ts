import { NodeSdk } from "@effect/opentelemetry";
import { BatchSpanProcessor } from "@opentelemetry/sdk-trace-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-proto";
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { PeriodicExportingMetricReader } from "@opentelemetry/sdk-metrics";
import { OTLPMetricExporter } from "@opentelemetry/exporter-metrics-otlp-proto";
import { Config, Effect, Layer } from "effect";
import { LLMLives } from "./live/llm.js";
import { useCaseLive } from "./live/usecase.js";

const nodeSdkLive = Layer.unwrapEffect(Effect.gen(function* () {
  const url = yield* Config.string("OTEL_EXPORTER_OTLP_ENDPOINT");
  const serviceName = yield* Config.string("OTEL_SERVICE_NAME");
  return NodeSdk.layer(() => ({
    resource: { serviceName },
    spanProcessor: new BatchSpanProcessor(new OTLPTraceExporter({
      url
    })),
    metricReader: new PeriodicExportingMetricReader({
      exporter: new OTLPMetricExporter({
        url
      }),
    }),
    instrumentations: [getNodeAutoInstrumentations()],
  }));
}))


export const serviceLive = () =>
	Layer.merge(LLMLives.typistAgentLive(), LLMLives.embeddingsLive).pipe(
		Layer.merge(Layer.provide(LLMLives.vectorStoreLive, LLMLives.embeddingsLive)),
		Layer.merge(nodeSdkLive),
	)

export const mainLive = () =>
	Layer.provideMerge(
		useCaseLive(),
		serviceLive()
	);

