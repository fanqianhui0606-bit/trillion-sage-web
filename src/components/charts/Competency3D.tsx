"use client";

import { useMemo, useRef, useState, useCallback, useEffect, Suspense } from "react";
import { Canvas, useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import * as ThreeLib from "three";
import WebGLErrorBoundary from "@/components/shared/WebGLErrorBoundary";
import {
  LEVEL_COLORS,
  DEFAULT_CAMERA_POSITION,
  DEFAULT_CAMERA_FOV,
  GLOW_POWER,
  GLOW_EMISSIVE_MIN,
  GLOW_EMISSIVE_RANGE,
  GLOW_HALO_OPACITY_MIN,
  GLOW_HALO_OPACITY_RANGE,
  GLOW_HALO_RING_BASE,
  GLOW_HALO_RING_FACTOR,
  SPRING_FORCE_FACTOR,
  SPRING_OFFSET_FACTOR,
  SPRING_LINEAR_FACTOR,
  SPRING_DAMPING,
  SPRING_MAX_OFFSET,
} from "@/lib/constants";
import type { GraphData, CompetencyVector } from "@/lib/types";

// ============================================================
// Types
// ============================================================

interface NodeRefData {
  nodeId: string;
  intensity: number;
  baseIntensity: number;
  basePosition: ThreeLib.Vector3;
  velocity: ThreeLib.Vector3;
  isDragging: boolean;
  level: number;
  title: string;
  definition: string;
  colorHex: string;
  groupRef: ThreeLib.Group | null;
}

interface DetailData {
  id: string;
  title: string;
  level: number;
  intensity: number;
  definition: string;
  colorHex: string;
  edges: { otherId: string; otherTitle: string; relation: string }[];
  isLocked?: boolean;
  lockedHint?: string;
}

interface EdgeLineMeta {
  fromId: string;
  toId: string;
  relation: string;
  lines: { offset: number; line: ThreeLib.Line }[];
}

// ============================================================
// Glow mapping
// ============================================================

function intensityToGlow(intensity: number) {
  const t = Math.max(1, Math.min(5, intensity));
  const k = Math.pow((t - 1) / 4, GLOW_POWER);
  return {
    emissive: GLOW_EMISSIVE_MIN + k * GLOW_EMISSIVE_RANGE,
    haloOpacity: GLOW_HALO_OPACITY_MIN + k * GLOW_HALO_OPACITY_RANGE,
    haloRingScale: GLOW_HALO_RING_BASE + t * GLOW_HALO_RING_FACTOR,
  };
}

// ============================================================
// Halo texture — shared singleton
// ============================================================

let sharedHaloTexture: ThreeLib.CanvasTexture | null = null;
function getHaloTexture(): ThreeLib.CanvasTexture {
  if (!sharedHaloTexture) {
    const c = document.createElement("canvas");
    c.width = 128;
    c.height = 128;
    const ctx = c.getContext("2d")!;
    const g = ctx.createRadialGradient(64, 64, 8, 64, 64, 64);
    g.addColorStop(0, "rgba(255,255,255,0.95)");
    g.addColorStop(0.42, "rgba(255,255,255,0.45)");
    g.addColorStop(0.75, "rgba(255,255,255,0.15)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 128, 128);
    sharedHaloTexture = new ThreeLib.CanvasTexture(c);
  }
  return sharedHaloTexture;
}

// ============================================================
// NodeSphere
// ============================================================

interface NodeGroup extends ThreeLib.Group {
  userData: { nodeId?: string };
}

function NodeSphere({
  node,
  colorHex,
  intensity,
  isLocked = false,
  onPointerDown,
  onRegister,
}: {
  node: GraphData["nodes"][number];
  colorHex: string;
  intensity: number;
  isLocked?: boolean;
  onPointerDown?: (e: ThreeEvent<PointerEvent>, nodeId: string) => void;
  onRegister?: (nodeId: string, refData: React.RefObject<NodeRefData>, group: NodeGroup) => void;
}) {
  const haloTexture = useMemo(() => getHaloTexture(), []);
  const groupRef = useRef<NodeGroup>(null!);
  const glow = useMemo(
    () => (isLocked ? { emissive: 0.08, haloOpacity: 0.12, haloRingScale: 0.85 } : intensityToGlow(intensity)),
    [intensity, isLocked],
  );
  const color = useMemo(
    () => new ThreeLib.Color(isLocked ? "#9ca3af" : colorHex),
    [colorHex, isLocked],
  );
  const spriteScale = 0.68 * glow.haloRingScale;
  const labelColor = isLocked ? "#9ca3af" : colorHex;

  const refData = useRef<NodeRefData>({
    nodeId: node.id,
    intensity,
    baseIntensity: intensity,
    basePosition: new ThreeLib.Vector3(node.position[0], node.position[1], node.position[2]),
    velocity: new ThreeLib.Vector3(),
    isDragging: false,
    level: node.level,
    title: node.title,
    definition: node.definition,
    colorHex: isLocked ? "#9ca3af" : colorHex,
    groupRef: null,
  });

  refData.current.basePosition.set(node.position[0], node.position[1], node.position[2]);
  refData.current.intensity = isLocked ? 0 : intensity;
  refData.current.baseIntensity = isLocked ? 0 : intensity;

  useEffect(() => {
    const grp = groupRef.current;
    const rd = refData.current;
    if (grp) {
      grp.userData.nodeId = node.id;
      rd.groupRef = grp;
      onRegister?.(node.id, refData, grp);
    }
    return () => {
      rd.groupRef = null;
      if (grp) delete grp.userData.nodeId;
    };
    // Run on mount/unmount; onRegister is stable via parent useRef
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [node.id]);

  const handlePointerDown = useCallback(
    (e: ThreeEvent<PointerEvent>) => {
      e.stopPropagation();
      onPointerDown?.(e, node.id);
    },
    [node.id, onPointerDown],
  );

  return (
    <group ref={groupRef} position={node.position}>
      <mesh onPointerDown={handlePointerDown}>
        <sphereGeometry args={[0.14, 24, 24]} />
        <meshStandardMaterial
          color={isLocked ? "#cbd5e1" : "#ffffff"}
          emissive={color}
          emissiveIntensity={glow.emissive}
          metalness={0.15}
          roughness={0.55}
          transparent={isLocked}
          opacity={isLocked ? 0.55 : 1}
        />
      </mesh>
      <sprite scale={[spriteScale, spriteScale, 1]}>
        <spriteMaterial
          map={haloTexture}
          color={color}
          transparent
          opacity={glow.haloOpacity}
          depthWrite={false}
          blending={ThreeLib.AdditiveBlending}
        />
      </sprite>
      <Html position={[0, 0.42, 0]} center style={{ pointerEvents: "none" }}>
        <span
          className="text-xs font-semibold whitespace-nowrap select-none"
          style={{ color: labelColor, opacity: isLocked ? 0.45 : 1, filter: isLocked ? "grayscale(1)" : "none" }}
        >
          {node.id}
        </span>
      </Html>
    </group>
  );
}

// ============================================================
// Detail panel
// ============================================================

function DetailPanel({ detail, onClose }: { detail: DetailData | null; onClose: () => void }) {
  if (!detail) return null;
  const levelZh: Record<number, string> = { 1: "一", 2: "二", 3: "三", 4: "四" };
  return (
    <div className="absolute bottom-4 left-4 right-4 z-20 pointer-events-none">
      <div className="pointer-events-auto max-w-sm mx-auto glass-panel p-4 text-sm animate-fade-in">
        <div className="flex items-start justify-between mb-2">
          <strong className="text-base" style={{ color: detail.colorHex }}>
            {detail.id}
          </strong>
          <button
            onClick={onClose}
            className="text-bridge-muted hover:text-bridge-text text-lg leading-none ml-2"
            aria-label="关闭"
          >
            &times;
          </button>
        </div>
        <p className="text-bridge-muted text-xs">
          {detail.title} · 第{levelZh[detail.level] ?? detail.level}层
          {detail.isLocked
            ? ` · 亮度 -- / 5 分（专业版解锁）`
            : ` · 亮度 ${detail.intensity.toFixed(1)}/5`}
        </p>
        <p className="text-bridge-text text-xs mt-1 leading-relaxed">{detail.definition}</p>
        {detail.isLocked && detail.lockedHint && (
          <p className="text-xs text-gray-400 mt-1 italic">{detail.lockedHint}</p>
        )}
        {detail.edges.length > 0 && (
          <div className="mt-2">
            <strong className="text-xs text-bridge-blue">关联素质</strong>
            <ul className="mt-1 text-xs text-bridge-muted space-y-0.5">
              {detail.edges.map((e, i) => (
                <li key={i}>
                  「{e.otherTitle}」
                  {e.relation === "peer" ? "：平级联系" : e.relation === "from" ? "：下层/因果" : "：上层/因果"}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================
// Main 3D scene
// ============================================================

function Scene3DInner({
  graphData,
  profileScores,
  lockedDimensions,
  lockedHint,
  onDetailChange,
}: {
  graphData: GraphData;
  profileScores?: CompetencyVector | null;
  lockedDimensions?: string[];
  lockedHint?: string;
  onDetailChange?: (data: DetailData | null) => void;
}) {
  const { camera, pointer } = useThree();
  const controlsRef = useRef<OrbitControlsImpl>(null!);
  const nodeMeshMap = useRef<Map<string, NodeGroup>>(new Map());
  const nodeDataMap = useRef<Map<string, React.RefObject<NodeRefData>>>(new Map());
  const edgeMetasRef = useRef<EdgeLineMeta[]>([]);

  // Camera reset state
  const resetRef = useRef({
    active: false,
    t: 0,
    fromPos: new ThreeLib.Vector3(),
    fromTarget: new ThreeLib.Vector3(),
    initialPos: new ThreeLib.Vector3(...DEFAULT_CAMERA_POSITION),
    initialTarget: new ThreeLib.Vector3(0, 1.4, 0),
  });

  // Drag state
  const dragRef = useRef({
    nodeId: null as string | null,
    dragPlane: new ThreeLib.Plane(),
    dragHit: new ThreeLib.Vector3(),
    dragOffset: new ThreeLib.Vector3(),
    pointerDownAt: 0,
  });

  // Selection
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  // Raycaster
  const raycasterRef = useRef(new ThreeLib.Raycaster());

  // ---- Node registration ----

  const handleNodeRegister = useCallback(
    (nodeId: string, refData: React.RefObject<NodeRefData>, group: NodeGroup) => {
      nodeMeshMap.current.set(nodeId, group);
      nodeDataMap.current.set(nodeId, refData);
    },
    [],
  );

  // Pool nodeDataMap — remove stale entries
  useEffect(() => {
    const valid = new Set(graphData.nodes.map((n) => n.id));
    const stale: string[] = [];
    nodeMeshMap.current.forEach((_, id) => {
      if (!valid.has(id)) stale.push(id);
    });
    for (const id of stale) {
      nodeMeshMap.current.delete(id);
      nodeDataMap.current.delete(id);
    }
  }, [graphData]);

  // ---- Picking ----

  const pickNode = useCallback((): NodeGroup | null => {
    raycasterRef.current.setFromCamera(new ThreeLib.Vector2(pointer.x, pointer.y), camera);
    const meshes = Array.from(nodeMeshMap.current.values());
    const hits = raycasterRef.current.intersectObjects(meshes, true);
    if (!hits.length) return null;
    let g: ThreeLib.Object3D = hits[0].object;
    while (g && !(g as NodeGroup).userData.nodeId) {
      g = g.parent as ThreeLib.Object3D;
    }
    return ((g as NodeGroup)?.userData?.nodeId ? (g as NodeGroup) : null);
  }, [camera, pointer]);

  // ---- Pointer handlers ----

  const handlePointerDown = useCallback(
    (e: ThreeEvent<PointerEvent>, nodeId: string) => {
      if (!controlsRef.current) return;
      const node = nodeMeshMap.current.get(nodeId);
      if (!node) return;

      dragRef.current.nodeId = nodeId;
      dragRef.current.pointerDownAt = performance.now();

      const nd = nodeDataMap.current.get(nodeId)?.current;
      if (nd) {
        nd.isDragging = true;
        nd.velocity.set(0, 0, 0);
      }

      controlsRef.current.enabled = false;

      const normal = camera.getWorldDirection(new ThreeLib.Vector3()).clone().negate();
      dragRef.current.dragPlane.setFromNormalAndCoplanarPoint(normal, node.position);
      raycasterRef.current.setFromCamera(new ThreeLib.Vector2(pointer.x, pointer.y), camera);
      if (raycasterRef.current.ray.intersectPlane(dragRef.current.dragPlane, dragRef.current.dragHit)) {
        dragRef.current.dragOffset.copy(node.position).sub(dragRef.current.dragHit);
      } else {
        dragRef.current.dragOffset.set(0, 0, 0);
      }
    },
    [camera, pointer],
  );

  const handlePointerUp = useCallback(() => {
    const nodeId = dragRef.current.nodeId;
    if (!nodeId) return;

    const elapsed = performance.now() - dragRef.current.pointerDownAt;
    const nd = nodeDataMap.current.get(nodeId)?.current;
    if (nd) nd.isDragging = false;

    if (controlsRef.current) controlsRef.current.enabled = true;

    if (elapsed < 220) {
      setSelectedNodeId(nodeId);
    }
    dragRef.current.nodeId = null;
  }, []);

  const handleDoubleClick = useCallback(() => {
    const node = pickNode();
    if (node) return;
    setSelectedNodeId(null);
    resetRef.current.active = true;
    resetRef.current.t = 0;
    resetRef.current.fromPos.copy(camera.position);
    resetRef.current.fromTarget.copy(
      controlsRef.current?.target ?? new ThreeLib.Vector3(0, 1.4, 0),
    );
  }, [camera, pickNode]);

  // ---- Detail data computed from selection ----

  const lockedSet = useMemo(() => new Set(lockedDimensions ?? []), [lockedDimensions]);

  const detailData = useMemo((): DetailData | null => {
    if (!selectedNodeId) return null;
    const node = graphData.nodes.find((n) => n.id === selectedNodeId);
    if (!node) return null;

    const isLocked = lockedSet.has(selectedNodeId);
    const ndRef = nodeDataMap.current.get(selectedNodeId);
    const intensity = isLocked ? 0 : (ndRef?.current?.intensity ?? node.intensity ?? 3);

    const relatedEdges = graphData.edges
      .filter((e) => e.from === selectedNodeId || e.to === selectedNodeId)
      .map((e) => {
        const otherId = e.from === selectedNodeId ? e.to : e.from;
        const otherNode = graphData.nodes.find((n) => n.id === otherId);
        const relation = e.relation === "peer" ? "peer" : e.from === selectedNodeId ? "from" : "to";
        return { otherId, otherTitle: otherNode ? `${otherId}（${otherNode.title}）` : otherId, relation };
      });

    return {
      id: node.id,
      title: node.title,
      level: node.level,
      intensity,
      definition: node.definition,
      colorHex: isLocked ? "#9ca3af" : (LEVEL_COLORS[node.level] || "#4b5563"),
      edges: relatedEdges,
      isLocked,
      lockedHint: isLocked ? lockedHint : undefined,
    };
  }, [selectedNodeId, graphData, lockedSet, lockedHint]);

  useEffect(() => {
    onDetailChange?.(detailData);
  }, [detailData, onDetailChange]);

  // ---- Edge line primitives ----

  const edgePrimitives = useMemo(() => {
    const metas: EdgeLineMeta[] = [];
    const prims: React.ReactNode[] = [];

    for (const edge of graphData.edges) {
      const aNode = graphData.nodes.find((n) => n.id === edge.from);
      const bNode = graphData.nodes.find((n) => n.id === edge.to);
      if (!aNode || !bNode) continue;

      const from = new ThreeLib.Vector3(aNode.position[0], aNode.position[1], aNode.position[2]);
      const to = new ThreeLib.Vector3(bNode.position[0], bNode.position[1], bNode.position[2]);
      const mid = new ThreeLib.Vector3().addVectors(from, to).multiplyScalar(0.5);
      mid.y += 0.38;
      const curve = new ThreeLib.QuadraticBezierCurve3(from, mid, to);
      const curvePoints = curve.getPoints(72);

      const count = edge.strength === "h" ? 3 : edge.strength === "m" ? 2 : 1;
      const spacing = edge.relation === "peer" ? 0.032 : 0.028;
      const offsets = count === 1 ? [0] : count === 2 ? [-spacing, spacing] : [-spacing, 0, spacing];

      const tangent = curve.getTangent(0.5).normalize();
      const sideVec = new ThreeLib.Vector3()
        .crossVectors(tangent, new ThreeLib.Vector3(0, 1, 0))
        .normalize();
      if (sideVec.lengthSq() < 1e-6) sideVec.set(1, 0, 0);

      const colorHex = edge.relation === "peer" ? "#8b9cb5" : "#6b7c94";
      const opacityBase = edge.relation === "peer" ? 0.52 : 0.38;
      const opacity = opacityBase + count * (edge.relation === "peer" ? 0.07 : 0.08);
      const isDashed = edge.relation === "peer";
      const dashSize = edge.strength === "h" ? 0.2 : edge.strength === "m" ? 0.15 : 0.11;
      const gapSize = dashSize * 0.7;

      const lines: EdgeLineMeta["lines"] = [];

      for (const offset of offsets) {
        const offsetPts = curvePoints.map((p) => p.clone().addScaledVector(sideVec, offset));
        const geom = new ThreeLib.BufferGeometry().setFromPoints(offsetPts);
        if (isDashed) {
          const mat = new ThreeLib.LineDashedMaterial({
            color: colorHex, dashSize, gapSize, transparent: true, opacity,
          });
          const line = new ThreeLib.Line(geom, mat);
          line.computeLineDistances();
          line.renderOrder = 1;
          lines.push({ offset, line });
          prims.push(<primitive key={`${edge.from}-${edge.to}-${offset}`} object={line} />);
        } else {
          const mat = new ThreeLib.LineBasicMaterial({
            color: colorHex, transparent: true, opacity,
          });
          const line = new ThreeLib.Line(geom, mat);
          line.renderOrder = 1;
          lines.push({ offset, line });
          prims.push(<primitive key={`${edge.from}-${edge.to}-${offset}`} object={line} />);
        }
      }

      metas.push({ fromId: edge.from, toId: edge.to, relation: edge.relation, lines });
    }

    edgeMetasRef.current = metas;
    return prims;
  }, [graphData]);

  // ---- Animation loop ----

  useFrame((_state, deltaRaw) => {
    const dt = Math.max(0.5, Math.min(2.2, deltaRaw * 60));

    // Node spring physics
    nodeMeshMap.current.forEach((group, id) => {
      const nd = nodeDataMap.current.get(id)?.current;
      if (!nd || nd.isDragging) return;

      const base = nd.basePosition;
      const offset = group.position.clone().sub(base);
      const fx = -Math.sin(offset.x * SPRING_OFFSET_FACTOR) * SPRING_FORCE_FACTOR - offset.x * SPRING_LINEAR_FACTOR;
      const fy = -Math.sin(offset.y * SPRING_OFFSET_FACTOR) * SPRING_FORCE_FACTOR - offset.y * SPRING_LINEAR_FACTOR;
      const fz = -Math.sin(offset.z * SPRING_OFFSET_FACTOR) * SPRING_FORCE_FACTOR - offset.z * SPRING_LINEAR_FACTOR;

      nd.velocity.add(new ThreeLib.Vector3(fx, fy, fz).multiplyScalar(dt));
      nd.velocity.multiplyScalar(Math.pow(SPRING_DAMPING, dt));
      group.position.addScaledVector(nd.velocity, dt);

      if (group.position.distanceToSquared(base) < 0.0002 && nd.velocity.lengthSq() < 0.00001) {
        group.position.copy(base);
        nd.velocity.set(0, 0, 0);
      }
    });

    // Drag movement
    if (dragRef.current.nodeId) {
      const node = nodeMeshMap.current.get(dragRef.current.nodeId);
      if (node) {
        raycasterRef.current.setFromCamera(new ThreeLib.Vector2(pointer.x, pointer.y), camera);
        if (raycasterRef.current.ray.intersectPlane(dragRef.current.dragPlane, dragRef.current.dragHit)) {
          const target = dragRef.current.dragHit.clone().add(dragRef.current.dragOffset);
          const base = nodeDataMap.current.get(dragRef.current.nodeId)?.current?.basePosition;
          if (base) {
            const rel = target.clone().sub(base);
            if (rel.length() > SPRING_MAX_OFFSET) {
              rel.setLength(SPRING_MAX_OFFSET);
              target.copy(base).add(rel);
            }
          }
          const nd = nodeDataMap.current.get(dragRef.current.nodeId)?.current;
          if (nd) nd.velocity.copy(target).sub(node.position);
          node.position.copy(target);
        }
      }
    }

    // Edge geometry update — rebuild curves from current node positions
    for (const meta of edgeMetasRef.current) {
      const fromGrp = nodeMeshMap.current.get(meta.fromId);
      const toGrp = nodeMeshMap.current.get(meta.toId);
      if (!fromGrp || !toGrp) continue;

      const from = fromGrp.position;
      const to = toGrp.position;
      const mid = new ThreeLib.Vector3().addVectors(from, to).multiplyScalar(0.5);
      mid.y += 0.38;
      const curve = new ThreeLib.QuadraticBezierCurve3(from, mid, to);
      const curvePoints = curve.getPoints(72);

      const tangent = curve.getTangent(0.5).normalize();
      const sideVec = new ThreeLib.Vector3()
        .crossVectors(tangent, new ThreeLib.Vector3(0, 1, 0))
        .normalize();
      if (sideVec.lengthSq() < 1e-6) sideVec.set(1, 0, 0);

      for (const sl of meta.lines) {
        const offsetPts = curvePoints.map((p) => p.clone().addScaledVector(sideVec, sl.offset));
        sl.line.geometry.setFromPoints(offsetPts);
        if (meta.relation === "peer") {
          sl.line.computeLineDistances();
        }
      }
    }

    // Camera reset animation (cubic ease-out)
    if (resetRef.current.active) {
      resetRef.current.t = Math.min(1, resetRef.current.t + 0.045);
      const eased = 1 - Math.pow(1 - resetRef.current.t, 3);
      camera.position.lerpVectors(resetRef.current.fromPos, resetRef.current.initialPos, eased);
      if (controlsRef.current) {
        controlsRef.current.target.lerpVectors(
          resetRef.current.fromTarget,
          resetRef.current.initialTarget,
          eased,
        );
      }
      if (resetRef.current.t >= 1) resetRef.current.active = false;
    }
  });

  return (
    <>
      <ambientLight intensity={0.35} />
      <directionalLight position={[4, 10, 6]} intensity={0.85} />
      <directionalLight position={[-6, 4, -4]} intensity={0.35} color="#b8c8ff" />

      {graphData.nodes.map((node) => {
        const isLocked = lockedSet.has(node.id);
        const colorHex = isLocked ? "#9ca3af" : (LEVEL_COLORS[node.level] || "#4b5563");
        const profileVal = isLocked ? null : profileScores?.[node.id];
        const intensity =
          profileVal != null ? Math.max(1, Math.min(5, profileVal)) : (isLocked ? 0 : (node.intensity ?? 3));
        return (
          <NodeSphere
            key={node.id}
            node={node}
            colorHex={colorHex}
            intensity={intensity}
            isLocked={isLocked}
            onPointerDown={handlePointerDown}
            onRegister={handleNodeRegister}
          />
        );
      })}

      {edgePrimitives}

      <OrbitControls
        ref={controlsRef}
        enableDamping
        target={[0, 1.4, 0]}
        enablePan
        enableZoom
      />

      {/* Invisible mesh for canvas-level pointer events */}
      <mesh visible={false} onPointerUp={handlePointerUp} onDoubleClick={handleDoubleClick}>
        <planeGeometry args={[100, 100]} />
      </mesh>
    </>
  );
}

// ============================================================
// Public component
// ============================================================

export default function Competency3D({
  graphData,
  profileScores,
  lockedDimensions,
  lockedHint,
  className = "",
}: {
  graphData: GraphData;
  profileScores?: CompetencyVector | null;
  lockedDimensions?: string[];
  lockedHint?: string;
  className?: string;
}) {
  const [detailData, setDetailData] = useState<DetailData | null>(null);

  return (
    <WebGLErrorBoundary>
      <div className={`relative w-full h-[500px] rounded-xl overflow-hidden bg-bridge-3d-bg ${className}`}>
        <Canvas
          camera={{
            position: DEFAULT_CAMERA_POSITION,
            fov: DEFAULT_CAMERA_FOV,
          }}
          dpr={[1, 2]}
          style={{ background: "#0a0f18" }}
        >
          <Suspense fallback={null}>
            <Scene3DInner
              graphData={graphData}
              profileScores={profileScores}
              lockedDimensions={lockedDimensions}
              lockedHint={lockedHint}
              onDetailChange={setDetailData}
            />
          </Suspense>
        </Canvas>
        <DetailPanel detail={detailData} onClose={() => setDetailData(null)} />
      </div>
    </WebGLErrorBoundary>
  );
}
