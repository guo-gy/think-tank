"use client";
import { useEffect, useRef } from "react";

export default function Hero3D() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let width = canvas.width = canvas.offsetWidth;
    let height = canvas.height = canvas.offsetHeight;
    let animationId;

    // 球体参数
    const POINTS = 38;
    const RADIUS = Math.min(width, height) * 0.36;
    const cx = width / 2;
    const cy = height / 2 + 6;
    // 生成球面点
    const points = Array.from({ length: POINTS }, (_, i) => {
      const t = Math.acos(1 - 2 * (i + 0.5) / POINTS);
      const p = Math.PI * (1 + Math.sqrt(5)) * (i + 0.5);
      return {
        base: {
          x: Math.sin(t) * Math.cos(p),
          y: Math.sin(t) * Math.sin(p),
          z: Math.cos(t)
        },
        x: 0, y: 0, z: 0,
        dx: 0, dy: 0, dz: 0,
        color: `hsl(${200 + 80 * Math.random()}, 80%, 65%)`
      };
    });
    let mouse = { x: -1000, y: -1000, active: false };

    function project(pt) {
      const scale = RADIUS * 0.98;
      return {
        x: cx + (pt.x + pt.dx) * scale,
        y: cy + (pt.y + pt.dy) * scale,
        z: pt.z + pt.dz
      };
    }

    function draw() {
      ctx.clearRect(0, 0, width, height);
      const now = Date.now() / 1000;
      // 球体自转
      const theta = now * 0.7;
      const phi = now * 0.45;
      // 计算所有点旋转后坐标+扰动
      for (const pt of points) {
        let { x, y, z } = pt.base;
        // 旋转
        let x1 = x * Math.cos(theta) - z * Math.sin(theta);
        let z1 = x * Math.sin(theta) + z * Math.cos(theta);
        let y1 = y * Math.cos(phi) - z1 * Math.sin(phi);
        z1 = y * Math.sin(phi) + z1 * Math.cos(phi);
        pt.x = x1;
        pt.y = y1;
        pt.z = z1;
        // 鼠标排斥
        const proj = project(pt);
        const dist = Math.hypot(mouse.x - proj.x, mouse.y - proj.y);
        if (dist < 60) {
          const angle = Math.atan2(proj.y - mouse.y, proj.x - mouse.x);
          const force = (60 - dist) / 60 * 0.18;
          pt.dx += Math.cos(angle) * force;
          pt.dy += Math.sin(angle) * force;
          pt.dz += (Math.random() - 0.5) * force * 0.12;
        }
        // 回归原位
        pt.dx += (0 - pt.dx) * 0.12;
        pt.dy += (0 - pt.dy) * 0.12;
        pt.dz += (0 - pt.dz) * 0.12;
      }
      // 画连线
      for (let i = 0; i < points.length; i++) {
        for (let j = i + 1; j < points.length; j++) {
          const a = points[i], b = points[j];
          const d = Math.hypot(a.x + a.dx - b.x - b.dx, a.y + a.dy - b.y - b.dy, a.z + a.dz - b.z - b.dz);
          if (d < 0.7) {
            const pa = project(a), pb = project(b);
            ctx.save();
            ctx.beginPath();
            ctx.moveTo(pa.x, pa.y);
            ctx.lineTo(pb.x, pb.y);
            // 背面线更淡
            const alpha = 0.18 + 0.18 * (pa.z + pb.z) / 2;
            ctx.strokeStyle = `rgba(99,102,241,${pa.z > 0 && pb.z > 0 ? alpha : alpha * 0.3})`;
            ctx.lineWidth = pa.z > 0 && pb.z > 0 ? 1.5 : 0.8;
            ctx.shadowColor = pa.z > 0 && pb.z > 0 ? '#a5b4fc' : 'transparent';
            ctx.shadowBlur = pa.z > 0 && pb.z > 0 ? 6 : 0;
            ctx.stroke();
            ctx.restore();
          }
        }
      }
      // 画点
      for (const pt of points) {
        const { x, y, z } = project(pt);
        ctx.save();
        ctx.beginPath();
        ctx.arc(x, y, z > 0 ? 4.2 : 2.7, 0, 2 * Math.PI);
        ctx.globalAlpha = z > 0 ? 0.88 : 0.32;
        ctx.fillStyle = pt.color;
        ctx.shadowColor = z > 0 ? pt.color : 'transparent';
        ctx.shadowBlur = z > 0 ? 10 : 0;
        ctx.fill();
        ctx.restore();
      }
      animationId = requestAnimationFrame(draw);
    }
    draw();
    // 鼠标事件
    function handleMouseMove(e) {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
      mouse.active = true;
    }
    function handleMouseLeave() {
      mouse.x = -1000;
      mouse.y = -1000;
      mouse.active = false;
    }
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);
    // 响应式
    function handleResize() {
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    }
    window.addEventListener('resize', handleResize);
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <div style={{width:'100%', height:300, position:'relative', overflow:'visible', display:'flex', justifyContent:'center', alignItems:'flex-start', marginTop: '-24px'}}>
      <div style={{width:'98%', height:'100%', position:'relative', background:'transparent', overflow:'visible', display:'flex', justifyContent:'center', alignItems:'center'}}>
        <canvas ref={canvasRef} style={{width:'100%',height:'100%',display:'block', overflow:'visible'}}/>
      </div>
    </div>
  );
}
