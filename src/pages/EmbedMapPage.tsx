import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { ArchiveEmbedHost, ArchiveMapEmbed } from "../components/ArchiveEmbed";
import { usePublicEmbedAutoHeight, useForwardInnerEmbedResize } from "../hooks/useEmbedAutoHeight";
import {
  periodDaysForId,
  resolvePublicEmbedPeriod,
} from "../lib/public-embed";

/** Javni iframe: občinski zemljevid + graf (brez mreže 1 × 1 km). */
export function EmbedMapPage() {
  const [params] = useSearchParams();
  const periodId = useMemo(() => resolvePublicEmbedPeriod("map", params), [params]);
  const periodDays = useMemo(() => periodDaysForId("map", periodId), [periodId]);

  usePublicEmbedAutoHeight(true);
  useForwardInnerEmbedResize("#archive-map-iframe");

  return (
    <div className="public-embed-page public-embed-page--map">
      <ArchiveEmbedHost />
      <ArchiveMapEmbed
        visible
        accessMode="public"
        periodDays={periodDays}
        hideGridTab
      />
    </div>
  );
}
