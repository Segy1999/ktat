import { cn } from "@/lib/utils";
import React, { useEffect, useRef, useState, useCallback } from "react";

interface MousePosition {
  x: number;
  y: number;
}

interface Circle {
  x: number;
  y: number;
  translateX: number;
  translateY: number;
  size: number;
  alpha: number;
  targetAlpha: number;
  dx: number;
  dy: number;
  magnetism: number;
}

interface ParticlesProps {
  className?: string;
  quantity?: number;
  staticity?: number;
  ease?: number;
  size?: number;
  refresh?: boolean;
  color?: string;
  vx?: number;
  vy?: number;
}

const useMousePosition = () => {
  const [mousePosition, setMousePosition] = useState<MousePosition>({ x: 0, y: 0 });
  const [touchPosition, setTouchPosition] = useState<MousePosition | null>(null);

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      setMousePosition({ x: event.clientX, y: event.clientY });
    };

    const handleTouchMove = (event: TouchEvent) => {
      if (event.touches.length > 0) {
        const touch = event.touches[0];
        setTouchPosition({ x: touch.clientX, y: touch.clientY });
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("touchmove", handleTouchMove, { passive: true });

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchmove", handleTouchMove);
    };
  }, []);

  return touchPosition || mousePosition;
};

const hexToRgb = (hex: string): number[] => {
  hex = hex.replace("#", "");
  if (hex.length === 3) {
    hex = hex.split("").map((char) => char + char).join("");
  }
  const hexInt = parseInt(hex, 16);
  return [
    (hexInt >> 16) & 255,
    (hexInt >> 8) & 255,
    hexInt & 255
  ];
};

export const Particles: React.FC<ParticlesProps> = ({
  className = "",
  quantity = 100,
  staticity = 50,
  ease = 50,
  size = 0.4,
  refresh = false,
  color = "#ffffff",
  vx = 0,
  vy = 0,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const context = useRef<CanvasRenderingContext2D | null>(null);
  const circles = useRef<Circle[]>([]);
  const mousePosition = useMousePosition();
  const mouse = useRef<{ x: number; y: number; isPressed: boolean }>({
    x: 0,
    y: 0,
    isPressed: false,
  });
  const canvasSize = useRef<{ w: number; h: number }>({ w: 0, h: 0 });
  const dpr = typeof window !== "undefined" ? window.devicePixelRatio : 1;
  const [isHovering, setIsHovering] = useState(false);
  const animationFrameId = useRef<number>();
  const resizeObserver = useRef<ResizeObserver>();

  const initCanvas = useCallback(() => {
    if (!canvasContainerRef.current || !canvasRef.current || !context.current) return;
    
    circles.current = [];
    canvasSize.current.w = canvasContainerRef.current.offsetWidth;
    canvasSize.current.h = canvasContainerRef.current.offsetHeight;
    
    canvasRef.current.width = canvasSize.current.w * dpr;
    canvasRef.current.height = canvasSize.current.h * dpr;
    canvasRef.current.style.width = `${canvasSize.current.w}px`;
    canvasRef.current.style.height = `${canvasSize.current.h}px`;
    
    context.current.scale(dpr, dpr);
    
    // Initialize particles
    for (let i = 0; i < quantity; i++) {
      circles.current.push(createCircle());
    }
  }, [dpr, quantity]);

  const createCircle = (): Circle => ({
    x: Math.random() * canvasSize.current.w,
    y: Math.random() * canvasSize.current.h,
    translateX: 0,
    translateY: 0,
    size: Math.random() * 2 + size,
    alpha: 0,
    targetAlpha: parseFloat((Math.random() * 0.6 + 0.1).toFixed(1)),
    dx: (Math.random() - 0.5) * 0.1,
    dy: (Math.random() - 0.5) * 0.1,
    magnetism: 0.1 + Math.random() * 4
  });

  const remapValue = (value: number, start1: number, end1: number, start2: number, end2: number): number => {
    const remapped = ((value - start1) * (end2 - start2)) / (end1 - start1) + start2;
    return remapped > 0 ? remapped : 0;
  };

  const drawCircle = (circle: Circle) => {
    if (!context.current) return;

    const { x, y, translateX, translateY, size, alpha } = circle;
    const rgb = hexToRgb(color);
    
    context.current.translate(translateX, translateY);
    context.current.beginPath();
    context.current.arc(x, y, size, 0, 2 * Math.PI);
    context.current.fillStyle = `rgba(${rgb.join(", ")}, ${alpha})`;
    context.current.fill();
    context.current.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  const animate = useCallback(() => {
    if (!context.current) return;

    context.current.clearRect(0, 0, canvasSize.current.w, canvasSize.current.h);

    circles.current.forEach((circle, i) => {
      // Edge detection
      const edge = [
        circle.x + circle.translateX - circle.size,
        canvasSize.current.w - circle.x - circle.translateX - circle.size,
        circle.y + circle.translateY - circle.size,
        canvasSize.current.h - circle.y - circle.translateY - circle.size,
      ];
      const closestEdge = Math.min(...edge);
      const edgeForce = remapValue(closestEdge, 0, 20, 0, 1);

      // Interactive effects
      if (mouse.current.isPressed) {
        const dx = circle.x - mouse.current.x;
        const dy = circle.y - mouse.current.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const force = Math.max(100 - distance, 0) / distance;
        
        circle.dx += (dx * force * 0.01);
        circle.dy += (dy * force * 0.01);
      }

      // Apply physics
      circle.dx *= 0.95;
      circle.dy *= 0.95;
      circle.x += circle.dx + vx;
      circle.y += circle.dy + vy;
      
      // Alpha & magnetism
      const targetAlpha = isHovering ? circle.targetAlpha * 1.5 : circle.targetAlpha;
      circle.alpha += (targetAlpha - circle.alpha) * 0.1;
      circle.alpha *= edgeForce;

      const magnetism = mouse.current.isPressed ? circle.magnetism * 0.5 : circle.magnetism;
      circle.translateX += (mouse.current.x / (staticity / magnetism) - circle.translateX) / ease;
      circle.translateY += (mouse.current.y / (staticity / magnetism) - circle.translateY) / ease;

      // Draw
      drawCircle(circle);

      // Regenerate if out of bounds
      if (
        circle.x < -circle.size ||
        circle.x > canvasSize.current.w + circle.size ||
        circle.y < -circle.size ||
        circle.y > canvasSize.current.h + circle.size
      ) {
        circles.current[i] = createCircle();
      }
    });

    animationFrameId.current = requestAnimationFrame(animate);
  }, [color, ease, isHovering, staticity, vx, vy]);

  useEffect(() => {
    if (canvasRef.current) {
      context.current = canvasRef.current.getContext("2d");
    }

    // Initialize ResizeObserver
    resizeObserver.current = new ResizeObserver(() => {
      if (document.hidden) return;
      initCanvas();
    });

    if (canvasContainerRef.current) {
      resizeObserver.current.observe(canvasContainerRef.current);
    }

    initCanvas();
    animate();

    const handleVisibilityChange = () => {
      if (!document.hidden && canvasContainerRef.current) {
        initCanvas();
      }
    };

    const handleInteractionStart = () => {
      mouse.current.isPressed = true;
    };

    const handleInteractionEnd = () => {
      mouse.current.isPressed = false;
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("mousedown", handleInteractionStart);
    window.addEventListener("mouseup", handleInteractionEnd);
    window.addEventListener("touchstart", handleInteractionStart, { passive: true });
    window.addEventListener("touchend", handleInteractionEnd);

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
      if (resizeObserver.current) {
        resizeObserver.current.disconnect();
      }
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("mousedown", handleInteractionStart);
      window.removeEventListener("mouseup", handleInteractionEnd);
      window.removeEventListener("touchstart", handleInteractionStart);
      window.removeEventListener("touchend", handleInteractionEnd);
    };
  }, [animate, initCanvas]);

  useEffect(() => {
    // Update mouse position
    if (canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const x = mousePosition.x - rect.left - canvasSize.current.w / 2;
      const y = mousePosition.y - rect.top - canvasSize.current.h / 2;
      const inside = x < canvasSize.current.w / 2 && x > -canvasSize.current.w / 2 && 
                    y < canvasSize.current.h / 2 && y > -canvasSize.current.h / 2;
      
      if (inside) {
        mouse.current.x = x;
        mouse.current.y = y;
      }
    }
  }, [mousePosition]);

  useEffect(() => {
    initCanvas();
  }, [refresh, initCanvas]);

  return (
    <div
      ref={canvasContainerRef}
      className={cn("fixed inset-0 pointer-events-none", className)}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: 'hidden',
        touchAction: 'none'
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none'
        }}
      />
    </div>
  );
};
