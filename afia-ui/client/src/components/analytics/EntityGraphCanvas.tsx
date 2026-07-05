import { useEffect, useRef } from "react";
import {
  drag,
  forceCenter,
  forceCollide,
  forceLink,
  forceManyBody,
  forceSimulation,
  select,
  zoom,
  zoomIdentity,
  type D3DragEvent,
  type Simulation,
  type SimulationLinkDatum,
  type SimulationNodeDatum,
  type ZoomBehavior,
} from "d3";
import type { LibraryGraphSpec } from "@/lib/documents";
import type { EntityNodeMeta } from "@/lib/entity-graph-builder";

interface GraphNode extends SimulationNodeDatum {
  id: string;
  label: string;
  type: string;
  pinned?: boolean;
  hidden?: boolean;
  radius: number;
}

interface GraphLink extends SimulationLinkDatum<GraphNode> {
  weight: number;
}

export interface EntityGraphCanvasProps {
  spec: LibraryGraphSpec;
  minCooccurrence: number;
  showLabels: boolean;
  nodeMeta: Map<string, EntityNodeMeta>;
  colorMap: Map<string, string>;
  selectedNodeId: string | null;
  onSelectNode: (id: string | null) => void;
  onSpecChange: (spec: LibraryGraphSpec) => void;
  onSvgReady?: (svg: SVGSVGElement | null) => void;
}

function nodeRadius(
  docFrequency: number,
  minFreq: number,
  maxFreq: number,
): number {
  if (maxFreq <= minFreq) return 14;
  const t = (docFrequency - minFreq) / (maxFreq - minFreq);
  return 8 + t * 18;
}

function syncSpecFromSimulation(
  spec: LibraryGraphSpec,
  nodes: GraphNode[],
): LibraryGraphSpec {
  const positions = new Map(
    nodes.map((n) => [
      n.id,
      {
        x: n.x,
        y: n.y,
        pinned: n.pinned,
      },
    ]),
  );

  return {
    ...spec,
    elements: spec.elements.map((el) => {
      const pos = positions.get(el.id);
      if (!pos) return el;
      return {
        ...el,
        x: pos.x,
        y: pos.y,
        pinned: pos.pinned,
      };
    }),
  };
}

export function EntityGraphCanvas({
  spec,
  minCooccurrence,
  showLabels,
  nodeMeta,
  colorMap,
  selectedNodeId,
  onSelectNode,
  onSpecChange,
  onSvgReady,
}: EntityGraphCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const specRef = useRef(spec);
  const onSpecChangeRef = useRef(onSpecChange);
  const onSelectNodeRef = useRef(onSelectNode);

  specRef.current = spec;
  onSpecChangeRef.current = onSpecChange;
  onSelectNodeRef.current = onSelectNode;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 640;
    const height = container.clientHeight || 520;

    const visibleElements = spec.elements.filter((el) => !el.hidden);
    const visibleIds = new Set(visibleElements.map((el) => el.id));

    const frequencies = visibleElements.map(
      (el) => nodeMeta.get(el.id)?.docFrequency ?? 1,
    );
    const minFreq = Math.min(...frequencies, 1);
    const maxFreq = Math.max(...frequencies, 1);

    const nodes: GraphNode[] = visibleElements.map((el) => ({
      id: el.id,
      label: el.label,
      type: el.type,
      pinned: el.pinned,
      hidden: el.hidden,
      x: el.x ?? width / 2 + (Math.random() - 0.5) * 40,
      y: el.y ?? height / 2 + (Math.random() - 0.5) * 40,
      fx: el.pinned && el.x !== undefined ? el.x : null,
      fy: el.pinned && el.y !== undefined ? el.y : null,
      radius: nodeRadius(
        nodeMeta.get(el.id)?.docFrequency ?? 1,
        minFreq,
        maxFreq,
      ),
    }));

    const nodeById = new Map(nodes.map((n) => [n.id, n]));

    const links: GraphLink[] = spec.connections
      .filter(
        (conn) =>
          conn.weight >= minCooccurrence &&
          visibleIds.has(conn.from) &&
          visibleIds.has(conn.to),
      )
      .map((conn) => ({
        source: conn.from,
        target: conn.to,
        weight: conn.weight,
      }))
      .filter(
        (link) =>
          nodeById.has(String(link.source)) &&
          nodeById.has(String(link.target)),
      );

    container.innerHTML = "";
    const svg = select(container)
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("role", "img")
      .attr("aria-label", "Entity relationship graph");

    svgRef.current = svg.node();
    onSvgReady?.(svgRef.current);

    const root = svg.append("g").attr("class", "graph-root");

    const zoomBehavior: ZoomBehavior<SVGSVGElement, unknown> = zoom<
      SVGSVGElement,
      unknown
    >()
      .scaleExtent([0.25, 4])
      .on("zoom", (event) => {
        root.attr("transform", event.transform.toString());
      });

    svg.call(zoomBehavior).on("dblclick.zoom", null);
    svg.call(zoomBehavior.transform, zoomIdentity);

    svg.on("click", (event: MouseEvent) => {
      if ((event.target as Element).tagName === "svg") {
        onSelectNodeRef.current(null);
      }
    });

    const linkSelection = root
      .append("g")
      .attr("stroke", "var(--color-hairline-strong)")
      .attr("stroke-opacity", 0.85)
      .selectAll<SVGLineElement, GraphLink>("line")
      .data(links)
      .join("line")
      .attr("stroke-width", (d: GraphLink) =>
        Math.max(1, Math.min(6, d.weight)),
      );

    const nodeSelection = root
      .append("g")
      .selectAll<SVGGElement, GraphNode>("g")
      .data(nodes, (d: GraphNode) => d.id)
      .join("g")
      .attr("cursor", "grab")
      .on("click", (event: MouseEvent, d: GraphNode) => {
        event.stopPropagation();
        onSelectNodeRef.current(d.id);
      })
      .on("contextmenu", (event: MouseEvent, d: GraphNode) => {
        event.preventDefault();
        onSelectNodeRef.current(d.id);
        const next = specRef.current.elements.map((el) =>
          el.id === d.id ? { ...el, hidden: true } : el,
        );
        onSpecChangeRef.current({ ...specRef.current, elements: next });
      });

    nodeSelection
      .append("circle")
      .attr("r", (d: GraphNode) => d.radius)
      .attr("fill", (d: GraphNode) => colorMap.get(d.type) ?? "var(--color-chart-1)")
      .attr("stroke", (d: GraphNode) =>
        d.id === selectedNodeId
          ? "var(--color-primary)"
          : "var(--color-hairline-strong)",
      )
      .attr("stroke-width", (d: GraphNode) =>
        d.id === selectedNodeId ? 2.5 : 1,
      );

    nodeSelection
      .append("text")
      .text((d: GraphNode) => d.label)
      .attr("text-anchor", "middle")
      .attr("dy", (d: GraphNode) => d.radius + 12)
      .attr("fill", "var(--color-foreground)")
      .attr("font-size", 10)
      .attr("pointer-events", "none")
      .style("display", showLabels ? "block" : "none");

    const maxWeight = Math.max(...links.map((l) => l.weight), 1);

    const simulation = forceSimulation(nodes)
      .force(
        "link",
        forceLink<GraphNode, GraphLink>(links)
          .id((d: GraphNode) => d.id)
          .distance((d: GraphLink) => 90 + (1 - d.weight / maxWeight) * 40)
          .strength((d: GraphLink) => Math.min(0.7, d.weight / maxWeight)),
      )
      .force("charge", forceManyBody().strength(-120))
      .force("center", forceCenter(width / 2, height / 2))
      .force(
        "collide",
        forceCollide<GraphNode>().radius((d: GraphNode) => d.radius + 6),
      );

    simulation.on("tick", () => {
      linkSelection
        .attr("x1", (d: GraphLink) => (d.source as GraphNode).x ?? 0)
        .attr("y1", (d: GraphLink) => (d.source as GraphNode).y ?? 0)
        .attr("x2", (d: GraphLink) => (d.target as GraphNode).x ?? 0)
        .attr("y2", (d: GraphLink) => (d.target as GraphNode).y ?? 0);

      nodeSelection.attr(
        "transform",
        (d: GraphNode) => `translate(${d.x ?? 0},${d.y ?? 0})`,
      );
    });

    const dragBehavior = drag<SVGGElement, GraphNode>()
      .on("start", (event: D3DragEvent<SVGGElement, GraphNode, GraphNode>, d) => {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
      })
      .on("drag", (event: D3DragEvent<SVGGElement, GraphNode, GraphNode>, d) => {
        d.fx = event.x;
        d.fy = event.y;
      })
      .on("end", (event: D3DragEvent<SVGGElement, GraphNode, GraphNode>, d) => {
        if (!event.active) simulation.alphaTarget(0);
        d.pinned = true;
        d.fx = d.x;
        d.fy = d.y;
        onSpecChangeRef.current(syncSpecFromSimulation(specRef.current, nodes));
      });

    nodeSelection.call(dragBehavior);

    nodeSelection.on("dblclick", (event: MouseEvent, d: GraphNode) => {
      event.stopPropagation();
      d.pinned = false;
      d.fx = null;
      d.fy = null;
      simulation.alpha(0.3).restart();
      onSpecChangeRef.current(syncSpecFromSimulation(specRef.current, nodes));
    });

    return () => {
      simulation.stop();
      container.innerHTML = "";
      svgRef.current = null;
      onSvgReady?.(null);
    };
  }, [
    spec,
    minCooccurrence,
    showLabels,
    nodeMeta,
    colorMap,
    selectedNodeId,
    onSvgReady,
  ]);

  return (
    <div
      ref={containerRef}
      className="h-full min-h-[480px] w-full rounded-md bg-surface"
    />
  );
}

export async function exportGraphPng(
  svg: SVGSVGElement,
  filename = "afia-entity-graph.png",
): Promise<void> {
  const clone = svg.cloneNode(true) as SVGSVGElement;
  const bg = getComputedStyle(document.documentElement)
    .getPropertyValue("--background")
    .trim();
  clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
  rect.setAttribute("width", "100%");
  rect.setAttribute("height", "100%");
  rect.setAttribute("fill", bg || "#ffffff");
  clone.insertBefore(rect, clone.firstChild);

  const serializer = new XMLSerializer();
  const source = serializer.serializeToString(clone);
  const blob = new Blob([source], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  await new Promise<void>((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = svg.clientWidth * 2;
      canvas.height = svg.clientHeight * 2;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Canvas unavailable"));
        return;
      }
      ctx.scale(2, 2);
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);
      canvas.toBlob((pngBlob) => {
        if (!pngBlob) {
          reject(new Error("PNG export failed"));
          return;
        }
        const link = document.createElement("a");
        link.href = URL.createObjectURL(pngBlob);
        link.download = filename;
        link.click();
        URL.revokeObjectURL(link.href);
        resolve();
      }, "image/png");
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to render graph snapshot"));
    };
    img.src = url;
  });
}

export function downloadGraphJson(
  spec: LibraryGraphSpec,
  filename = "afia-entity-graph.json",
): void {
  const blob = new Blob([JSON.stringify(spec, null, 2)], {
    type: "application/json",
  });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}
