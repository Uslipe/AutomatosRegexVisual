import React, { useRef, useState } from "react";
import "./css/Canvas.css";

//Representa um estado-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
interface Estado {
  id: number;
  x: number;
  y: number;
  nome: string;
}

//Representa uma transição---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
interface Transicao {
  origemNome: string;
  destinoNome: string;
  simbolo: string;
}

//Define as propriedades do canvas-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
interface CanvasProps {
  modoCriarEstado: boolean;
  setModoCriarEstado: React.Dispatch<React.SetStateAction<boolean>>;
  modoCriarTransicao: boolean;
  setModoCriarTransicao: React.Dispatch<React.SetStateAction<boolean>>;
}

const Canvas: React.FC<CanvasProps> = ({ modoCriarEstado, setModoCriarEstado, modoCriarTransicao, setModoCriarTransicao }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: -2500, y: -2500 });
  const [isDragging, setIsDragging] = useState(false);
  const lastMousePos = useRef({ x: 0, y: 0 });
  const [estadoSelecionadoId, setEstadoSelecionadoId] = useState<number | null>(null);
  const dragOffset = useRef({ x: 0, y: 0 });

  // Estados criados
  const [estados, setEstados] = useState<Estado[]>([]);
  const [contador, setContador] = useState(0);

  // Transições
  const [transicoes, setTransicoes] = useState<Transicao[]>([]);
  const [estadoOrigemTransicao, setEstadoOrigemTransicao] = useState<Estado | null>(null);

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
    e.stopPropagation();

    if (modoCriarTransicao) {
      if (!estadoOrigemTransicao) {
        setEstadoOrigemTransicao(estado);
      } else {
        const simbolo = prompt("Digite o símbolo da transição:");
        if (!simbolo || simbolo.trim() === "") return;

        const novaTransicao: Transicao = {
          origemNome: estadoOrigemTransicao.nome,
          destinoNome: estado.nome,
          simbolo: simbolo.trim(),
        };

        setTransicoes((prev) => [...prev, novaTransicao]);
        setEstadoOrigemTransicao(null);
        setModoCriarTransicao(false); // volta ao modo padrão
      }
      return;
    }

    // Lógica de drag continua igual:
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
        {transicoes.map((t, idx) => {
          const origem = estados.find(e => e.nome === t.origemNome);
          const destino = estados.find(e => e.nome === t.destinoNome);
          if (!origem || !destino) return null;

          const x1 = origem.x;
          const y1 = origem.y;
          const x2 = destino.x;
          const y2 = destino.y;

          return (
            <svg key={idx} style={{ position: "absolute", left: 0, top: 0, width: "100%", height: "100%" }}>
              <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="black" strokeWidth={2} />
              <text x={(x1 + x2) / 2} y={(y1 + y2) / 2 - 5} fontSize="16" fill="black">
                {t.simbolo}
              </text>
            </svg>
          );
        })}

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
              backgroundColor: estadoOrigemTransicao?.id === estado.id ? "#e0f7fa" : "#fff",
              border: estadoOrigemTransicao?.id === estado.id ? "3px solid #2196f3" : "2px solid #000",
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
  