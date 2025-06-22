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

    // 3D 球体点阵参数
    const POINTS = 27; // 适中点数
    const RADIUS = 90;
    const SPEED = 0.0032;
    let theta = 0;
    let phi = 0;
    let mouse = { x: 0, y: 0, active: false };

    // 生成球面点
    const points = Array.from({ length: POINTS }, (_, i) => {
      const t = Math.acos(1 - 2 * (i + 0.5) / POINTS);
      const p = Math.PI * (1 + Math.sqrt(5)) * (i + 0.5);
      return {
        x: RADIUS * Math.sin(t) * Math.cos(p),
        y: RADIUS * Math.sin(t) * Math.sin(p),
        z: RADIUS * Math.cos(t),
        base: null,
        dx: 0, dy: 0, dz: 0,
        color: `hsl(${220 + 80 * Math.random()}, 80%, 60%)`, // 随机炫彩
      };
    });
    points.forEach(pt => pt.base = { x: pt.x, y: pt.y, z: pt.z });

    let scaleTick = 0;
    function draw() {
      ctx.clearRect(0, 0, width, height);
      theta += SPEED;
      phi += SPEED * 0.7;
      scaleTick += SPEED * 0.7;
      // 呼吸缩放
      const scaleBase = 1.08 + 0.18 * Math.sin(scaleTick);
      // 点扰动
      for (const pt of points) {
        pt.dx += (0 - pt.dx) * 0.07;
        pt.dy += (0 - pt.dy) * 0.07;
        pt.dz += (0 - pt.dz) * 0.07;
        // 鼠标高亮反馈
        if (mouse.active) {
          let x0 = pt.base.x, y0 = pt.base.y, z0 = pt.base.z;
          let x = x0 * Math.cos(theta) - z0 * Math.sin(theta);
          let z = x0 * Math.sin(theta) + z0 * Math.cos(theta);
          let y = y0 * Math.cos(phi) - z * Math.sin(phi);
          z = y0 * Math.sin(phi) + z * Math.cos(phi);
          const scale = 1.2 + z / (RADIUS * 2);
          const px = width / 2 + x * scale * scaleBase;
          const py = height / 2 + y * scale * scaleBase;
          const dist = Math.hypot(mouse.x - px, mouse.y - py);
          if (dist < 90) {
            const angle = Math.atan2(py - mouse.y, px - mouse.x);
            const force = (90 - dist) / 90 * 2.2;
            pt.dx += Math.cos(angle) * force;
            pt.dy += Math.sin(angle) * force;
            pt.dz += (Math.random() - 0.5) * force * 0.08;
          }
        }
        // 轻微漂浮扰动
        pt.dx += Math.sin(scaleTick + pt.base.x) * 0.04;
        pt.dy += Math.cos(scaleTick + pt.base.y) * 0.04;
      }
      // 绘制所有点和连线
      for (let i = 0; i < points.length; i++) {
        const pt = points[i];
        let x = (pt.base.x + pt.dx) * Math.cos(theta) - (pt.base.z + pt.dz) * Math.sin(theta);
        let z = (pt.base.x + pt.dx) * Math.sin(theta) + (pt.base.z + pt.dz) * Math.cos(theta);
        let y = (pt.base.y + pt.dy) * Math.cos(phi) - z * Math.sin(phi);
        z = (pt.base.y + pt.dy) * Math.sin(phi) + z * Math.cos(phi);
        const scale = (1.2 + z / (RADIUS * 2)) * scaleBase;
        const px = width / 2 + x * scale;
        const py = height / 2 + y * scale;
        // 连线：与距离较近的点连线
        for (let j = i + 1; j < points.length; j++) {
          const pt2 = points[j];
          let x2 = (pt2.base.x + pt2.dx) * Math.cos(theta) - (pt2.base.z + pt2.dz) * Math.sin(theta);
          let z2 = (pt2.base.x + pt2.dx) * Math.sin(theta) + (pt2.base.z + pt2.dz) * Math.cos(theta);
          let y2 = (pt2.base.y + pt2.dy) * Math.cos(phi) - z2 * Math.sin(phi);
          z2 = (pt2.base.y + pt2.dy) * Math.sin(phi) + z2 * Math.cos(phi);
          const scale2 = (1.2 + z2 / (RADIUS * 2)) * scaleBase;
          const px2 = width / 2 + x2 * scale2;
          const py2 = height / 2 + y2 * scale2;
          const d = Math.hypot(px - px2, py - py2);
          const zAvg = (z + z2) / 2;
          // 线的宽度和渐变
          let widthLine = 2.5 + 4.5 * ((zAvg / RADIUS + 1) / 2) * (1 - d / 120);
          if (d < 120) {
            ctx.save();
            ctx.globalAlpha = 0.7 - d / 180 + 0.2 * ((zAvg / RADIUS + 1) / 2);
            const grad = ctx.createLinearGradient(px, py, px2, py2);
            grad.addColorStop(0, pt.color);
            grad.addColorStop(1, pt2.color);
            ctx.strokeStyle = grad;
            ctx.shadowColor = pt.color;
            ctx.shadowBlur = 8 + 12 * ((zAvg / RADIUS + 1) / 2);
            ctx.lineWidth = widthLine;
            ctx.beginPath();
            ctx.moveTo(px, py);
            ctx.lineTo(px2, py2);
            ctx.stroke();
            ctx.restore();
          }
        }
        // 绘制点
        ctx.save();
        let pointAlpha = 0.85 + 0.15 * (z / RADIUS);
        ctx.globalAlpha = pointAlpha;
        ctx.beginPath();
        let r = 3.2 + 2.8 * scale * (0.7 + 0.3 * (z / RADIUS));
        ctx.arc(px, py, r, 0, 2 * Math.PI);
        const grad = ctx.createRadialGradient(px, py, 0, px, py, r * 2.2);
        grad.addColorStop(0, pt.color);
        grad.addColorStop(0.5, '#fff');
        grad.addColorStop(1, 'rgba(99,102,241,0)');
        ctx.fillStyle = grad;
        ctx.shadowColor = pt.color;
        ctx.shadowBlur = 18 * scale * (0.7 + 0.6 * (z / RADIUS));
        ctx.fill();
        ctx.restore();
      }
      animationId = requestAnimationFrame(draw);
    }
    draw();
    // 响应式
    function handleResize() {
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    }
    window.addEventListener('resize', handleResize);
    // 鼠标事件
    function handleMouseMove(e) {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
      mouse.active = true;
    }
    function handleMouseLeave() {
      mouse.active = false;
    }
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <div style={{width:'100%', height:300, position:'relative', overflow:'visible', display:'flex', justifyContent:'center', alignItems:'flex-start', marginTop: '-32px'}}>
      <div style={{width:'98%', height:'100%', position:'relative', background:'transparent', overflow:'visible', display:'flex', justifyContent:'center', alignItems:'center'}}>
        <canvas ref={canvasRef} style={{width:'100%',height:'100%',display:'block', overflow:'visible'}}/>
      </div>
    </div>
  );
}
