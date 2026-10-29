"use client";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { BrushPicker } from "@/components/playground/neural-net/brush-picker";
import { ModelControls } from "@/components/playground/neural-net/model-controls";
import { Readout } from "@/components/playground/neural-net/readout";
import { SceneCanvas } from "@/components/playground/neural-net/scene-canvas";
import { ShapesPanel } from "@/components/playground/neural-net/shapes-panel";
import { TransportControls } from "@/components/playground/neural-net/transport-controls";
import { useNeuralNet } from "@/components/playground/neural-net/use-neural-net";

export const NeuralNetContent = () => {
  const t = useTranslations("NeuralNet");
  const net = useNeuralNet();

  return (
    <div className="mx-auto max-w-6xl px-6 pt-16 pb-16 md:pt-24">
      <Link
        href="/playground"
        className="eyebrow mb-6 inline-block hover:text-accent"
      >
        ← {t("back")}
      </Link>
      <h1 className="display text-4xl sm:text-6xl">{t("title")}</h1>
      <p className="mt-6 max-w-2xl text-lg text-ink-soft">{t("intro")}</p>

      <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div>
          <SceneCanvas
            canvasRef={net.canvasRef}
            cursorRef={net.cursorRef}
            brush={net.brush}
            onAdd={net.addPoint}
            onRedraw={net.redraw}
          />
          <BrushPicker brush={net.brush} onChange={net.setBrush} />
        </div>

        <div className="flex flex-col gap-6">
          {net.loadError ? (
            <p role="alert" className="text-base">
              {t("loadError")}
            </p>
          ) : null}
          <ModelControls
            datasets={net.datasets}
            dataset={net.dataset}
            onDataset={net.pickDataset}
            config={net.config}
            onConfig={net.updateConfig}
          />
          <TransportControls
            disabled={!net.ready}
            playing={net.playing}
            onToggle={net.togglePlaying}
            onStep={net.step}
            onReset={net.reset}
          />
          <Readout
            stats={net.stats}
            backend={net.backend}
            loadError={net.loadError}
          />
          <ShapesPanel pointCount={net.pointCount} config={net.config} />
        </div>
      </div>

      <div className="mt-12 grid max-w-3xl gap-4 text-lg text-ink-soft">
        <p>{t("whatIsTensor")}</p>
        <p>{t("memoryNote")}</p>
      </div>
    </div>
  );
};
