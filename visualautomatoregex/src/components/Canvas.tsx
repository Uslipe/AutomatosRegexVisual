import React, { useRef, useState } from "react";
import "./css/Canvas.css";

//Representa um estado-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
export interface Estado {
  id: number;
  x: number;
  y: number;
  nome: string;
}

//Representa uma transição---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
export interface Transicao {
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
  onClickLimparAutomato: () => void;
  estados: Estado[];
  setEstados: React.Dispatch<React.SetStateAction<Estado[]>>;
  transicoes: Transicao[];
  setTransicoes: React.Dispatch<React.SetStateAction<Transicao[]>>;
  contador: number;
  setContador: React.Dispatch<React.SetStateAction<number>>;
  estadoOrigemTransicao: Estado | null;
  setEstadoOrigemTransicao: React.Dispatch<React.SetStateAction<Estado | null>>;
}


const Canvas: React.FC<CanvasProps> = ({
  modoCriarEstado,
  setModoCriarEstado,
  modoCriarTransicao,
  setModoCriarTransicao,
  onClickLimparAutomato,
  estados,
  setEstados,
  transicoes,
  setTransicoes,
  contador,
  setContador
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: -2500, y: -2500 });
  const [isDragging, setIsDragging] = useState(false);
  const lastMousePos = useRef({ x: 0, y: 0 });
  const [estadoSelecionadoId, setEstadoSelecionadoId] = useState<number | null>(null);
  const dragOffset = useRef({ x: 0, y: 0 });
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

    const formData = new URLSearchParams();
    formData.append("x-NomeEstado", nome.trim());
    formData.append("x-isFinal", "false"); // ou "true" se quiser, depende do seu fluxo
    formData.append("x-isInicial", "false"); // ou true, se quiser
    formData.append("x-X", xNoCanvas.toString());
    formData.append("x-Y", yNoCanvas.toString());

    // Envia para o backend:
    fetch('http://localhost:8080/automatosregex/PostCriarEstado', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: formData.toString(),
    })
    .then(async (response) => {
      if (!response.ok) {
        const error = await response.json();
        alert("Erro: " + (error.erro || "Falha ao criar estado no servidor."));
        return;
      }
      // Se deu certo, cria localmente o estado no React
      const novoEstado: Estado = {
        id: contador,
        x: xNoCanvas,
        y: yNoCanvas,
        nome: nome.trim(),
      };
      setEstados((prev) => [...prev, novoEstado]);
      setContador((c) => c + 1);
      setModoCriarEstado(false);
    })
    .catch(() => {
      alert("Erro de conexão com o servidor.");
    });

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

        fetch('http://localhost:8080/automatosregex/PostCriarTransicao', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `x-Inicial=${encodeURIComponent(estadoOrigemTransicao.nome)}&x-Expressao=${encodeURIComponent(simbolo.trim())}&x-Destino=${encodeURIComponent(estado.nome)}`
      })
        .then(async (response) => {
          if (!response.ok) {
            const error = await response.json();
            alert("Erro: " + (error.erro || "Falha ao criar transição no servidor."));
            return;
          }

          // Transição criada com sucesso no backend, atualiza no frontend
          setTransicoes((prev) => [...prev, novaTransicao]);
          setEstadoOrigemTransicao(null);
          setModoCriarTransicao(false);
        })
        .catch(() => {
          alert("Erro de conexão com o servidor.");
        });

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
          const raio = 25;

          if (origem.id === destino.id) {
            // Transição para o mesmo estado → curva circular
            const offsetY = -raio * 2.5;

            const pathD = `
              M ${x1} ${y1}
              C ${x1 + 40} ${y1 + offsetY}, ${x1 - 40} ${y1 + offsetY}, ${x1} ${y1}
            `;

            return (
              <svg key={idx} style={{ position: "absolute", left: 0, top: 0, width: "100%", height: "100%" }}>
                <defs>
                  <marker
                    id={`arrowhead-${idx}`}
                    markerWidth="10"
                    markerHeight="7"
                    refX="10"
                    refY="3.5"
                    orient="auto"
                  >
                    <polygon points="0 0, 10 3.5, 0 7" fill="black" />
                  </marker>
                </defs>

                <path
                  d={pathD}
                  fill="none"
                  stroke="black"
                  strokeWidth={2}
                  markerEnd={`url(#arrowhead-${idx})`}
                />
                <text
                  x={x1}
                  y={y1 + offsetY - 10}
                  fontSize="16"
                  fill="black"
                  textAnchor="middle"
                >
                  {t.simbolo}
                </text>
              </svg>
            );
          }

          // Transição entre estados diferentes → linha com seta fora do destino
          const dx = x2 - x1;
          const dy = y2 - y1;
          const distancia = Math.sqrt(dx * dx + dy * dy);
          const ajustadoX2 = x2 - (dx / distancia) * raio;
          const ajustadoY2 = y2 - (dy / distancia) * raio;

          return (
            <svg key={idx} style={{ position: "absolute", left: 0, top: 0, width: "100%", height: "100%" }}>
              <defs>
                <marker
                  id={`arrowhead-${idx}`}
                  markerWidth="10"
                  markerHeight="7"
                  refX="10"
                  refY="3.5"
                  orient="auto"
                >
                  <polygon points="0 0, 10 3.5, 0 7" fill="black" />
                </marker>
              </defs>

              <line
                x1={x1}
                y1={y1}
                x2={ajustadoX2}
                y2={ajustadoY2}
                stroke="black"
                strokeWidth={2}
                markerEnd={`url(#arrowhead-${idx})`}
              />
              <text
                x={(x1 + x2) / 2}
                y={(y1 + y2) / 2 - 5}
                fontSize="16"
                fill="black"
              >
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
  