import { useLocation, useNavigate } from "react-router-dom";
import {
  ArchiveChartEmbed,
  ArchiveEmbedHost,
  ArchiveMapEmbed,
  StatistikaTabs,
} from "../components/ArchiveEmbed";
import type { StatTab } from "../types";

function statTabFromHash(hash: string): StatTab {
  return hash.replace(/^#/, "") === "zemljevid" ? "zemljevid" : "grafi";
}

export function StatistikaPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const tab = statTabFromHash(location.hash);

  const onTab = (next: StatTab) => {
    navigate(next === "grafi" ? "/statistika" : "/statistika#zemljevid");
  };

  return (
    <>
      <ArchiveEmbedHost />
      <section className="archive-charts-page page--standard">
        <div className="archive-charts-head page-header">
          <h2>Statistika strel v Sloveniji</h2>
          <p className="archive-charts-lead">
            Pregled števila strel po dnevih, urah, statističnih regijah in občinah.
          </p>
          <StatistikaTabs tab={tab} onChange={onTab} />
        </div>
        <ArchiveChartEmbed
          wrapId="archive-embed-full-wrap"
          iframeId="archive-embed-full"
          scope="full"
          visible={tab === "grafi"}
        />
        <ArchiveMapEmbed visible={tab === "zemljevid"} />
      </section>
    </>
  );
}
