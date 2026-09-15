import React, { useRef, useEffect, useState } from 'react';
import { Share2, ZoomIn, ZoomOut, RefreshCw, AlertCircle, Eye } from 'lucide-react';

export default function NetworkGraph({ graphData = { nodes: [], edges: [], metrics: {} }, targetAccount }) {
  const canvasRef = useRef(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const nodes = graphData.nodes || [];
  const edges = graphData.edges || [];
  const metrics = graphData.metrics || {};

  // Simple layout computation
  const nodePositions = useRef({});

  useEffect(() => {
    // Arrange nodes in a circular / radial layout centered on subject
    const width = 600;
    const height = 400;
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
  }, [graphData, targetAccount, zoom, pan, selectedNode]);

  const drawGraph = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);
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
        ctx.strokeStyle = '#f43f5e'; // Rose glow for circular loops
        ctx.lineWidth = 3;
        ctx.shadowColor = 'rgba(244, 63, 94, 0.6)';
        ctx.shadowBlur = 8;
      } else {
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.35)';
        ctx.lineWidth = 1.5;
        ctx.shadowBlur = 0;
      }
      ctx.stroke();
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
      ctx.fillStyle = edge.is_circular ? '#f43f5e' : '#38bdf8';
      ctx.fill();

      // Draw amount label
      const midX = (p1.x + p2.x) / 2;
      const midY = (p1.y + p2.y) / 2;
      ctx.font = '10px JetBrains Mono, monospace';
      ctx.fillStyle = edge.is_circular ? '#fb7185' : '#94a3b8';
      ctx.fillText(`$${(edge.amount / 1000).toFixed(1)}k`, midX + 4, midY - 4);
    });

    // 2. Draw Nodes
    nodes.forEach((node) => {
      const pos = positions[node.id];
      if (!pos) return;

      const isSelected = selectedNode?.id === node.id;
      const isSubject = node.id === targetAccount || node.is_subject;

      ctx.beginPath();
      ctx.arc(pos.x, pos.y, isSubject ? 22 : 18, 0, 2 * Math.PI);

      if (node.in_cycle) {
        ctx.fillStyle = '#881337';
        ctx.strokeStyle = '#f43f5e';
        ctx.lineWidth = 2.5;
        ctx.shadowColor = 'rgba(244, 63, 94, 0.7)';
        ctx.shadowBlur = 10;
      } else if (isSubject) {
        ctx.fillStyle = '#083344';
        ctx.strokeStyle = '#06b6d4';
        ctx.lineWidth = 3;
        ctx.shadowColor = 'rgba(6, 182, 212, 0.7)';
        ctx.shadowBlur = 12;
      } else if (node.type.includes('HUB') || node.out_degree >= 3) {
        ctx.fillStyle = '#451a03';
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 2;
      } else {
        ctx.fillStyle = '#0f172a';
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 1.5;
      }

      ctx.fill();
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Draw node label
      ctx.font = isSubject ? 'bold 11px Inter, sans-serif' : '10px Inter, sans-serif';
      ctx.fillStyle = isSubject ? '#67e8f9' : '#e2e8f0';
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
      {/* Header & Graph Metrics */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Share2 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Interactive Money-Flow Entity Network</h3>
            <p className="text-xs text-slate-400">
              Graph topology showing {nodes.length} accounts & {edges.length} payment channels
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {metrics.has_circular_flow && (
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-rose-950/70 border border-rose-800/80 text-rose-300 text-xs font-semibold animate-pulse">
              <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
              Circular Round-Trip Loop Detected
            </span>
          )}

          <button 
            onClick={() => setZoom(prev => Math.min(prev + 0.2, 2.5))}
            className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button 
            onClick={() => setZoom(prev => Math.max(prev - 0.2, 0.5))}
            className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button 
            onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); setSelectedNode(null); }}
            className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs"
            title="Reset View"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Canvas Area */}
      <div className="relative bg-[#090d16] border border-slate-800/90 rounded-xl overflow-hidden flex items-center justify-center min-h-[380px]">
        <canvas
          ref={canvasRef}
          width={650}
          height={380}
          onClick={handleCanvasClick}
          className="cursor-pointer"
        />

        {/* Selected Node Mini Inspector */}
        {selectedNode && (
          <div className="absolute bottom-3 left-3 right-3 p-3 bg-slate-900/95 backdrop-blur-md border border-slate-700/80 rounded-lg text-xs flex items-center justify-between shadow-2xl font-mono">
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-cyan-400"></div>
              <div>
                <span className="text-white font-bold">{selectedNode.id}</span>
                <span className="text-slate-400 ml-2">Type: {selectedNode.type}</span>
              </div>
            </div>
            <div className="flex items-center gap-4 text-slate-300">
              <span>Total In: <strong className="text-emerald-400">${selectedNode.total_in.toLocaleString()}</strong></span>
              <span>Total Out: <strong className="text-rose-400">${selectedNode.total_out.toLocaleString()}</strong></span>
              <span>Centrality: <strong className="text-cyan-400">{selectedNode.centrality}</strong></span>
            </div>
          </div>
        )}
      </div>

      {/* Graph Legend */}
      <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono pt-1">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 ring-2 ring-cyan-500/30"></span> Subject Entity
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-rose-500/30"></span> Circular Cycle Node
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Mule Hub Disperser
          </span>
        </div>
        <div>
          Max Path Depth: <strong>{metrics.max_hops || 1} Hops</strong>
        </div>
      </div>
    </div>
  );
}
