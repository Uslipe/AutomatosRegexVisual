import React, { useRef, useState } from "react";
import "./css/Canvas.css";

//Representa um estado-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
interface Estado {
  id: number;
  x: number;
  y: number;
  nome: string;
}

//Define as propriedades do canvas-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
interface CanvasProps {
  modoCriarEstado: boolean;
  setModoCriarEstado: React.Dispatch<React.SetStateAction<boolean>>;
}

const Canvas: React.FC<CanvasProps> = ({ modoCriarEstado, setModoCriarEstado }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: -2500, y: -2500 });
  const [isDragging, setIsDragging] = useState(false);
  const lastMousePos = useRef({ x: 0, y: 0 });
  const [estadoSelecionadoId, setEstadoSelecionadoId] = useState<number | null>(null);
  const dragOffset = useRef({ x: 0, y: 0 });

  // Estados criados
  const [estados, setEstados] = useState<Estado[]>([]);
  const [contador, setContador] = useState(0);

  // Inicia drag do canvas (pan)
  const handleMouseDown = (e: React.MouseEvent) => {
    if (modoCriarEstado) return; // bloqueia drag se estiver criando estado
    setIsDragging(true);
    lastMousePos.current = { x: e.clientX, y: e.clientY };
  };

  // Drag do canvas ou mover estado selecionado
  const handleMouseMove = (e: React.MouseEvent) => {
    if (estadoSelecionadoId !== null) {
      const rect = containerRef.current!.getBoundingClientRect();
      const x = e.clientX - rect.left - position.x - dragOffset.current.x;
      const y = e.clientY - rect.top - position.y - dragOffset.current.y;

      setEstados((prev) =>
        prev.map((estado) =>
          estado.id === estadoSelecionadoId
            ? { ...estado, x, y }
            : estado
        )
      );
      return;
    }

    if (!isDragging) return;

    const dx = e.clientX - lastMousePos.current.x;
    const dy = e.clientY - lastMousePos.current.y;

    setPosition((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
    lastMousePos.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setEstadoSelecionadoId(null);
  };

  // Cria estado ao clicar no canvas
  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!modoCriarEstado) return;
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const xNoCanvas = e.clientX - rect.left - position.x;
    const yNoCanvas = e.clientY - rect.top - position.y;

    const nome = prompt("Digite o nome do estado:");
    if (!nome || nome.trim() === "") return;

    const novoEstado: Estado = {
      id: contador,
      x: xNoCanvas,
      y: yNoCanvas,
      nome: nome.trim(),
    };

    setEstados((prev) => [...prev, novoEstado]);
    setContador((c) => c + 1);
    setModoCriarEstado(false);
  };

  // Inicia drag de um estado para mover
  const handleMouseDownEstado = (e: React.MouseEvent, estado: Estado) => {
    e.stopPropagation(); // evita propagação e drag do canvas
    setEstadoSelecionadoId(estado.id);

    const rect = containerRef.current!.getBoundingClientRect();
    dragOffset.current = {
      x: e.clientX - (estado.x + position.x + rect.left),
      y: e.clientY - (estado.y + position.y + rect.top),
    };
  };

  return (
    <div
      className="canvas"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onClick={handleClick}
      ref={containerRef}
    >
      <div
        className="canvas-inner"
        style={{
          transform: `translate(${position.x}px, ${position.y}px)`,
          position: "relative",
          width: 10000,
          height: 10000,
          backgroundImage: "radial-gradient(#ccc 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
      >
        {estados.map((estado) => (
          <div
            key={estado.id}
            className="estado"
            onMouseDown={(e) => handleMouseDownEstado(e, estado)}
            style={{
              position: "absolute",
              left: estado.x - 25,
              top: estado.y - 25,
              width: 50,
              height: 50,
              borderRadius: "50%",
              backgroundColor: "#fff",
              border: "2px solid #000",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              fontWeight: "bold",
              userSelect: "none",
              cursor: "pointer",
              color: "#000",
            }}
          >
            {estado.nome}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Canvas;
  