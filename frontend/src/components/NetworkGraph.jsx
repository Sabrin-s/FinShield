import React, { useRef, useEffect, useState } from 'react';
import { Share2, ZoomIn, ZoomOut, RefreshCw, AlertCircle } from 'lucide-react';

export default function NetworkGraph({ graphData = { nodes: [], edges: [], metrics: {} }, targetAccount, theme }) {
  const canvasRef = useRef(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });

  const isLight = theme === 'light';
  const nodes = graphData.nodes || [];
  const edges = graphData.edges || [];
  const metrics = graphData.metrics || {};

  const nodePositions = useRef({});

  useEffect(() => {
    const width = 650;
    const height = 380;
    const centerX = width / 2;
    const centerY = height / 2;

    const newPositions = {};
    if (nodes.length === 1) {
      newPositions[nodes[0].id] = { x: centerX, y: centerY };
    } else {
      nodes.forEach((node, i) => {
        if (node.id === targetAccount || node.is_subject) {
          newPositions[node.id] = { x: centerX, y: centerY };
        } else {
          const angle = (i / Math.max(1, nodes.length - 1)) * 2 * Math.PI;
          const radius = 140 + (i % 2) * 35;
          newPositions[node.id] = {
            x: centerX + radius * Math.cos(angle),
            y: centerY + radius * Math.sin(angle)
          };
        }
      });
    }
    nodePositions.current = newPositions;
    drawGraph();
  }, [graphData, targetAccount, zoom, pan, selectedNode, theme]);

  const drawGraph = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Canvas background
    ctx.fillStyle = isLight ? '#ffffff' : '#050507';
    ctx.fillRect(0, 0, width, height);

    ctx.save();
    ctx.translate(pan.x, pan.y);
    ctx.scale(zoom, zoom);

    const positions = nodePositions.current;

    // 1. Draw Edges
    edges.forEach((edge) => {
      const p1 = positions[edge.source];
      const p2 = positions[edge.target];
      if (!p1 || !p2) return;

      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);

      if (edge.is_circular) {
        ctx.strokeStyle = isLight ? '#000000' : '#ffffff';
        ctx.lineWidth = 3;
        ctx.setLineDash([6, 4]);
      } else {
        ctx.strokeStyle = isLight ? '#94a3b8' : '#52525b';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([]);
      }
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.shadowBlur = 0;

      // Draw Arrow Head
      const headlen = 10;
      const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x);
      const edgeTargetX = p2.x - 22 * Math.cos(angle);
      const edgeTargetY = p2.y - 22 * Math.sin(angle);

      ctx.beginPath();
      ctx.moveTo(edgeTargetX, edgeTargetY);
      ctx.lineTo(
        edgeTargetX - headlen * Math.cos(angle - Math.PI / 6),
        edgeTargetY - headlen * Math.sin(angle - Math.PI / 6)
      );
      ctx.lineTo(
        edgeTargetX - headlen * Math.cos(angle + Math.PI / 6),
        edgeTargetY - headlen * Math.sin(angle + Math.PI / 6)
      );
      ctx.fillStyle = isLight ? '#000000' : '#ffffff';
      ctx.fill();

      // Draw amount label
      const midX = (p1.x + p2.x) / 2;
      const midY = (p1.y + p2.y) / 2;
      ctx.font = 'bold 10px JetBrains Mono, monospace';
      ctx.fillStyle = isLight ? '#334155' : '#a1a1aa';
      ctx.fillText(`$${(edge.amount / 1000).toFixed(1)}k`, midX + 4, midY - 4);
    });

    // 2. Draw Nodes
    nodes.forEach((node) => {
      const pos = positions[node.id];
      if (!pos) return;

      const isSubject = node.id === targetAccount || node.is_subject;

      ctx.beginPath();
      ctx.arc(pos.x, pos.y, isSubject ? 22 : 18, 0, 2 * Math.PI);

      if (node.in_cycle) {
        ctx.fillStyle = isLight ? '#e2e8f0' : '#27272a';
        ctx.strokeStyle = isLight ? '#000000' : '#ffffff';
        ctx.lineWidth = 3;
      } else if (isSubject) {
        ctx.fillStyle = isLight ? '#000000' : '#ffffff';
        ctx.strokeStyle = isLight ? '#000000' : '#ffffff';
        ctx.lineWidth = 3;
      } else if (node.type.includes('HUB') || node.out_degree >= 3) {
        ctx.fillStyle = isLight ? '#f4f4f5' : '#3f3f46';
        ctx.strokeStyle = isLight ? '#000000' : '#d4d4d8';
        ctx.lineWidth = 2;
      } else {
        ctx.fillStyle = isLight ? '#f8fafc' : '#18181b';
        ctx.strokeStyle = isLight ? '#64748b' : '#52525b';
        ctx.lineWidth = 1.5;
      }

      ctx.fill();
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Draw node label
      ctx.font = isSubject ? 'bold 11px Inter, sans-serif' : '10px Inter, sans-serif';
      ctx.fillStyle = isLight ? '#000000' : '#e4e4e7';
      ctx.textAlign = 'center';

      const shortLabel = node.id.length > 14 ? node.id.substring(0, 12) + '...' : node.id;
      ctx.fillText(shortLabel, pos.x, pos.y + 32);
    });

    ctx.restore();
  };

  const handleCanvasClick = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = (e.clientX - rect.left - pan.x) / zoom;
    const clickY = (e.clientY - rect.top - pan.y) / zoom;

    const positions = nodePositions.current;
    let clicked = null;
    nodes.forEach((node) => {
      const pos = positions[node.id];
      if (pos) {
        const dist = Math.hypot(clickX - pos.x, clickY - pos.y);
        if (dist <= 24) clicked = node;
      }
    });

    setSelectedNode(clicked);
  };

  return (
    <div className="glass-panel p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: 'var(--border-main)' }}>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg border flex items-center justify-center"
            style={{ backgroundColor: 'var(--bg-subtle)', borderColor: 'var(--border-main)', color: 'var(--text-main)' }}>
            <Share2 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold" style={{ color: 'var(--text-main)' }}>Interactive Money-Flow Entity Network</h3>
            <p className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
              Graph topology showing {nodes.length} accounts & {edges.length} payment channels
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {metrics.has_circular_flow && (
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs font-bold"
              style={{ backgroundColor: 'var(--bg-subtle)', borderColor: 'var(--border-main)', color: 'var(--text-main)' }}>
              <AlertCircle className="w-3.5 h-3.5" />
              Circular Loop Detected
            </span>
          )}

          <button
            onClick={() => setZoom(prev => Math.min(prev + 0.2, 2.5))}
            className="p-1.5 rounded-lg border text-xs cursor-pointer"
            style={{ backgroundColor: 'var(--bg-subtle)', borderColor: 'var(--border-main)', color: 'var(--text-main)' }}
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setZoom(prev => Math.max(prev - 0.2, 0.5))}
            className="p-1.5 rounded-lg border text-xs cursor-pointer"
            style={{ backgroundColor: 'var(--bg-subtle)', borderColor: 'var(--border-main)', color: 'var(--text-main)' }}
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); setSelectedNode(null); }}
            className="p-1.5 rounded-lg border text-xs cursor-pointer"
            style={{ backgroundColor: 'var(--bg-subtle)', borderColor: 'var(--border-main)', color: 'var(--text-main)' }}
            title="Reset View"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div className="relative border rounded-xl overflow-hidden flex items-center justify-center min-h-[380px]"
        style={{ borderColor: 'var(--border-main)' }}>
        <canvas
          ref={canvasRef}
          width={650}
          height={380}
          onClick={handleCanvasClick}
          className="cursor-pointer"
        />

        {selectedNode && (
          <div className="absolute bottom-3 left-3 right-3 p-3 border rounded-lg text-xs flex items-center justify-between shadow-lg font-mono"
            style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-main)', color: 'var(--text-main)' }}>
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: 'var(--text-main)' }}></div>
              <div>
                <span className="font-bold">{selectedNode.id}</span>
                <span className="ml-2 font-semibold" style={{ color: 'var(--text-muted)' }}>Type: {selectedNode.type}</span>
              </div>
            </div>
            <div className="flex items-center gap-4 font-bold">
              <span>In: <strong>${selectedNode.total_in.toLocaleString()}</strong></span>
              <span>Out: <strong>${selectedNode.total_out.toLocaleString()}</strong></span>
              <span>Centrality: <strong>{selectedNode.centrality}</strong></span>
            </div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-between text-[11px] font-mono font-bold pt-1" style={{ color: 'var(--text-muted)' }}>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full border-2" style={{ backgroundColor: isLight ? '#000' : '#fff', borderColor: isLight ? '#000' : '#fff' }}></span> Subject Entity
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full border-2" style={{ backgroundColor: 'var(--bg-subtle)', borderColor: 'var(--text-main)' }}></span> Circular Cycle
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: 'var(--text-muted)' }}></span> Mule Hub
          </span>
        </div>
        <div>
          Max Path Depth: <strong style={{ color: 'var(--text-main)' }}>{metrics.max_hops || 1} Hops</strong>
        </div>
      </div>
    </div>
  );
}
