import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ArchiveChartEmbed,
  ArchiveEmbedHost,
  ArchiveMapEmbed,
  StatistikaTabs,
} from "../components/ArchiveEmbed";
import { useStrelko } from "../context/StrelkoContext";
import type { StatTab } from "../types";

export function StatistikaPage() {
  const { statistikaTab, setStatTab } = useStrelko();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const hash = location.hash.replace("#", "");
    if (hash === "zemljevid" || hash === "grafi") setStatTab(hash);
  }, [location.hash, setStatTab]);

  const onTab = (tab: StatTab) => {
    setStatTab(tab);
    navigate(tab === "grafi" ? "/statistika" : `/statistika#${tab}`, { replace: true });
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
          <StatistikaTabs tab={statistikaTab} onChange={onTab} />
        </div>
        <ArchiveChartEmbed
          wrapId="archive-embed-full-wrap"
          iframeId="archive-embed-full"
          scope="full"
          visible={statistikaTab === "grafi"}
        />
        <ArchiveMapEmbed visible={statistikaTab === "zemljevid"} />
      </section>
    </>
  );
}
