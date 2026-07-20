/**
 * Enotni testi pomožnih funkcij predogleda widgeta občin.
 * Zagon: npx --yes tsx --test tests/widget-obcine.test.ts
 */
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { WidgetState } from "../src/types";
import {
  isObcinaPreviewCachedMessage,
  isObcinaPreviewUpdateMessage,
  NATIONAL_WIDGET_SCOPE,
  OBCINA_PREVIEW_CACHED_TYPE,
  OBCINA_PREVIEW_UPDATE_TYPE,
  widgetPreviewDataKey,
  widgetPreviewTokenKey,
} from "../src/lib/widget-obcine";

function baseWidget(partial: Partial<WidgetState> = {}): WidgetState {
  return {
    publicWidgetObMid: 11026516,
    publicWidgetObMids: [11026516],
    publicWidgetObcine: [],
    publicWidgetScope: null,
    publicWidgetTheme: "dark",
    publicWidgetPreviewSize: "compact",
    publicWidgetLat: null,
    publicWidgetLon: null,
    publicWidgetLabel: "",
    ...partial,
  } as WidgetState;
}

describe("widgetPreviewDataKey", () => {
  it("uses municipality id without theme/size", () => {
    const a = widgetPreviewDataKey(
      baseWidget({ publicWidgetTheme: "dark", publicWidgetPreviewSize: "compact" })
    );
    const b = widgetPreviewDataKey(
      baseWidget({ publicWidgetTheme: "light", publicWidgetPreviewSize: "full" })
    );
    assert.equal(a, "ob:11026516");
    assert.equal(a, b);
  });

  it("uses national scope key", () => {
    assert.equal(
      widgetPreviewDataKey(baseWidget({ publicWidgetScope: NATIONAL_WIDGET_SCOPE })),
      NATIONAL_WIDGET_SCOPE
    );
  });
});

describe("widgetPreviewTokenKey", () => {
  it("ignores theme and size for coalesce key", () => {
    assert.equal(
      widgetPreviewTokenKey({
        ob_mid: 1,
        theme: "dark",
        size: "compact",
      }),
      widgetPreviewTokenKey({
        ob_mid: 1,
        theme: "light",
        size: "full",
      })
    );
  });
});

describe("preview message guards", () => {
  it("accepts display-only theme/size update without token", () => {
    assert.equal(
      isObcinaPreviewUpdateMessage({
        type: OBCINA_PREVIEW_UPDATE_TYPE,
        theme: "light",
        size: "full",
      }),
      true
    );
  });

  it("accepts cache replay by dataKey", () => {
    assert.equal(
      isObcinaPreviewUpdateMessage({
        type: OBCINA_PREVIEW_UPDATE_TYPE,
        dataKey: "ob:11026516",
        theme: "dark",
        size: "compact",
      }),
      true
    );
  });

  it("rejects empty update", () => {
    assert.equal(isObcinaPreviewUpdateMessage({ type: OBCINA_PREVIEW_UPDATE_TYPE }), false);
  });

  it("recognizes cached ack from iframe", () => {
    assert.equal(
      isObcinaPreviewCachedMessage({
        type: OBCINA_PREVIEW_CACHED_TYPE,
        dataKey: "ob:11026516",
      }),
      true
    );
  });
});

describe("theme/size must not share data key with municipality", () => {
  it("documents that API refetch identity is dataKey only", () => {
    const darkCompact = widgetPreviewDataKey(baseWidget());
    const lightFull = widgetPreviewDataKey(
      baseWidget({ publicWidgetTheme: "light", publicWidgetPreviewSize: "full" })
    );
    const otherMuni = widgetPreviewDataKey(baseWidget({ publicWidgetObMid: 24063526 }));
    assert.equal(darkCompact, lightFull);
    assert.notEqual(darkCompact, otherMuni);
  });
});
