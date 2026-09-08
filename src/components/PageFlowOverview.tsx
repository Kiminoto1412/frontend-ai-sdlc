"use client";

import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Panel,
  Handle,
  Position,
  MarkerType,
  type Node,
  type Edge,
  type NodeProps,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { ShoppingCart, LayoutGrid, UserPlus } from "lucide-react";

type PageNodeData = {
  title: string;
  path: string;
  status: "built" | "planned";
  thumbnail: "home" | "design" | "product" | "listing" | "cart" | "auth";
};

const hiddenHandle = { opacity: 0, width: 6, height: 6 } as const;

function AllHandles() {
  return (
    <>
      <Handle type="target" position={Position.Top} id="top-t" style={hiddenHandle} />
      <Handle type="source" position={Position.Top} id="top-s" style={hiddenHandle} />
      <Handle type="target" position={Position.Bottom} id="bottom-t" style={hiddenHandle} />
      <Handle type="source" position={Position.Bottom} id="bottom-s" style={hiddenHandle} />
      <Handle type="target" position={Position.Left} id="left-t" style={hiddenHandle} />
      <Handle type="source" position={Position.Left} id="left-s" style={hiddenHandle} />
      <Handle type="target" position={Position.Right} id="right-t" style={hiddenHandle} />
      <Handle type="source" position={Position.Right} id="right-s" style={hiddenHandle} />
    </>
  );
}

function HomeThumbnail() {
  return (
    <div className="flex h-full flex-col gap-1.5">
      <div className="flex items-center gap-1">
        <div className="h-2 w-8 rounded-sm bg-foreground" />
        <div className="h-2 flex-1 rounded-sm bg-zinc-100" />
        <div className="h-2 w-2 rounded-full bg-zinc-200" />
        <div className="h-2 w-2 rounded-full bg-zinc-200" />
      </div>
      <div className="h-1.5 w-16 rounded-sm bg-brand" />
      <div className="flex h-8 gap-1">
        <div className="flex-[2] rounded-sm bg-sky-100" />
        <div className="flex-1 rounded-sm bg-brand" />
      </div>
      <div className="flex gap-0.5">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-2 w-2 rounded-full bg-zinc-100" />
        ))}
      </div>
      <div className="grid flex-1 grid-cols-4 gap-0.5">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="rounded-sm bg-zinc-100" />
        ))}
      </div>
    </div>
  );
}

function DesignThumbnail() {
  return (
    <div className="flex h-full gap-1.5">
      <div className="flex w-6 flex-col gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-1 rounded-sm bg-zinc-100" />
        ))}
      </div>
      <div className="flex flex-1 flex-col gap-1.5">
        <div className="h-2 w-14 rounded-sm bg-foreground" />
        <div className="flex gap-1">
          <div className="h-3 w-3 rounded-sm bg-brand" />
          <div className="h-3 w-3 rounded-sm bg-brand-dark" />
          <div className="h-3 w-3 rounded-sm bg-red-600" />
          <div className="h-3 w-3 rounded-sm bg-zinc-300" />
        </div>
        <div className="h-1.5 w-full rounded-sm bg-zinc-100" />
        <div className="h-1.5 w-3/4 rounded-sm bg-zinc-100" />
        <div className="mt-auto h-3 w-10 rounded-sm bg-brand" />
      </div>
    </div>
  );
}

function ProductThumbnail() {
  return (
    <div className="flex h-full flex-col gap-1.5">
      <div className="flex flex-1 gap-1.5">
        <div className="w-14 rounded-sm bg-amber-100" />
        <div className="flex flex-1 flex-col gap-1">
          <div className="h-1.5 w-3/4 rounded-sm bg-foreground" />
          <div className="h-1 w-1/2 rounded-sm bg-zinc-100" />
          <div className="h-2 w-8 rounded-sm bg-brand" />
          <div className="mt-auto flex gap-1">
            <div className="h-3 w-6 rounded-sm border border-zinc-200" />
            <div className="h-3 flex-1 rounded-sm bg-brand" />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-4 gap-0.5">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-2 rounded-sm bg-zinc-100" />
        ))}
      </div>
    </div>
  );
}

function PlannedThumbnail({ icon: Icon }: { icon: typeof ShoppingCart }) {
  return (
    <div className="flex h-full items-center justify-center rounded-md border border-dashed border-zinc-300 bg-zinc-50">
      <Icon size={22} className="text-zinc-300" />
    </div>
  );
}

function PageNode({ data }: NodeProps<Node<PageNodeData>>) {
  const isBuilt = data.status === "built";

  return (
    <div
      className={`w-56 overflow-hidden rounded-lg shadow-sm ${
        isBuilt ? "ring-1 ring-brand/30" : "ring-1 ring-zinc-200"
      } bg-white`}
    >
      <AllHandles />

      <div className="flex items-center gap-1 border-b border-zinc-100 bg-zinc-50 px-2 py-1.5">
        <span className="h-1.5 w-1.5 rounded-full bg-red-300" />
        <span className="h-1.5 w-1.5 rounded-full bg-yellow-300" />
        <span className="h-1.5 w-1.5 rounded-full bg-green-300" />
        <span className="ml-1 truncate text-[9px] text-zinc-400">{data.path}</span>
      </div>

      <div className="h-24 bg-white p-2">
        {data.thumbnail === "home" && <HomeThumbnail />}
        {data.thumbnail === "design" && <DesignThumbnail />}
        {data.thumbnail === "product" && <ProductThumbnail />}
        {data.thumbnail === "listing" && <PlannedThumbnail icon={LayoutGrid} />}
        {data.thumbnail === "cart" && <PlannedThumbnail icon={ShoppingCart} />}
        {data.thumbnail === "auth" && <PlannedThumbnail icon={UserPlus} />}
      </div>

      <div className="flex items-center justify-between border-t border-zinc-100 px-2 py-1.5">
        <span className="text-xs font-semibold text-foreground">{data.title}</span>
        <span
          className={`rounded px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide ${
            isBuilt ? "bg-brand-soft text-brand-dark" : "bg-zinc-100 text-zinc-400"
          }`}
        >
          {isBuilt ? "Built" : "Planned"}
        </span>
      </div>
    </div>
  );
}

const nodeTypes = { page: PageNode };

const nodes: Node<PageNodeData>[] = [
  { id: "home", type: "page", position: { x: 860, y: 40 }, data: { title: "Home", path: "/", status: "built", thumbnail: "home" } },
  { id: "design", type: "page", position: { x: 140, y: 420 }, data: { title: "Design System", path: "/design", status: "built", thumbnail: "design" } },
  { id: "product", type: "page", position: { x: 860, y: 420 }, data: { title: "Product Detail", path: "/product/[id]", status: "built", thumbnail: "product" } },
  { id: "listing", type: "page", position: { x: 1580, y: 420 }, data: { title: "Category / Listing", path: "(not built)", status: "planned", thumbnail: "listing" } },
  { id: "auth", type: "page", position: { x: 500, y: 760 }, data: { title: "Signup / Login", path: "(not built)", status: "planned", thumbnail: "auth" } },
  { id: "cart", type: "page", position: { x: 1220, y: 760 }, data: { title: "Cart", path: "(not built)", status: "planned", thumbnail: "cart" } },
];

const labelStyleBase = {
  fontSize: 10,
  fontWeight: 600,
};

const labelBg = {
  fill: "#ffffff",
  fillOpacity: 0.92,
};

function makeEdge(
  id: string,
  source: string,
  target: string,
  sourceHandle: string,
  targetHandle: string,
  label: string,
  variant: "real" | "planned"
): Edge {
  const color = variant === "real" ? "#f5a623" : "#a1a1aa";
  return {
    id,
    source,
    target,
    sourceHandle,
    targetHandle,
    type: "smoothstep",
    label,
    labelStyle: { ...labelStyleBase, fill: variant === "real" ? "#e0940f" : "#71717a" },
    labelBgStyle: labelBg,
    labelBgPadding: [4, 2],
    labelBgBorderRadius: 4,
    style: {
      stroke: color,
      strokeWidth: variant === "real" ? 2 : 1.5,
      strokeDasharray: variant === "real" ? undefined : "5 5",
    },
    markerEnd: { type: MarkerType.ArrowClosed, color, width: 16, height: 16 },
  };
}

const edges: Edge[] = [
  makeEdge("design-home", "design", "home", "top-s", "left-t", "Link", "real"),
  makeEdge("product-home", "product", "home", "top-s", "bottom-t", "Link", "real"),
  makeEdge("home-listing", "home", "listing", "right-s", "top-t", 'href="#"', "planned"),
  makeEdge("home-auth", "home", "auth", "left-s", "top-t", "no submit", "planned"),
  makeEdge("home-cart", "home", "cart", "bottom-s", "top-t", "static icon", "planned"),
  makeEdge("listing-product", "listing", "product", "left-s", "right-t", "would link", "planned"),
  makeEdge("product-cart", "product", "cart", "bottom-s", "left-t", "no nav", "planned"),
];

const findings = [
  '"/design" and "/product/[id]" are orphans — nothing on Home links to them.',
  "Product cards on Home don't link to /product/[id]; Add To Cart doesn't navigate.",
  '"You Might Also Like" cards on the product page don\'t link to other products.',
  "Cart, Category/Listing, and Signup/Login are referenced by href=\"#\" placeholders but not built.",
];

export default function PageFlowOverview() {
  return (
    <div className="min-h-0 w-full flex-1">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        proOptions={{ hideAttribution: true }}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
      >
        <Background gap={20} color="#e4e4e7" />
        <Controls showInteractive={false} />
        <MiniMap
          pannable
          zoomable
          nodeColor={(n) => (n.data.status === "built" ? "#f5a623" : "#d4d4d8")}
        />

        <Panel position="top-left">
          <div className="rounded-lg border border-zinc-100 bg-white/95 px-3 py-2 text-[11px] shadow-sm">
            <div className="mb-1 flex items-center gap-2">
              <span className="h-0.5 w-4 bg-brand" />
              <span className="text-zinc-600">Real link in code</span>
            </div>
            <div className="flex items-center gap-2">
              <span
                className="h-0.5 w-4 bg-zinc-300"
                style={{ backgroundImage: "repeating-linear-gradient(90deg,#a1a1aa 0 3px,transparent 3px 6px)" }}
              />
              <span className="text-zinc-600">Placeholder / not built</span>
            </div>
          </div>
        </Panel>

        <Panel position="top-right">
          <div className="w-64 rounded-lg border border-zinc-100 bg-white/95 p-3 text-[11px] shadow-sm">
            <div className="mb-1.5 text-xs font-semibold text-foreground">Findings</div>
            <ul className="list-disc space-y-1 pl-3 text-zinc-500">
              {findings.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
          </div>
        </Panel>
      </ReactFlow>
    </div>
  );
}
