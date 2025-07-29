import React, { useRef, useState } from "react";
import "./css/Canvas.css";

//Representa um estado-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
export interface Estado {
  id: number;
  x: number;
  y: number;
  nome: string;
  isInicial: boolean;
  isFinal: boolean;
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
  modoDefinirInicial: boolean;
  setModoDefinirInicial: React.Dispatch<React.SetStateAction<boolean>>;
  modoDefinirFinal: boolean;
  setModoDefinirFinal: React.Dispatch<React.SetStateAction<boolean>>;
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
  modoDefinirInicial,
  setModoDefinirInicial,
  modoDefinirFinal,
  setModoDefinirFinal,
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

//=====================================================================================================================================================================================================
//  FUNÇÕES
//=====================================================================================================================================================================================================

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
        isInicial: false,
        isFinal: false
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

    // 👉 Se estiver definindo estado inicial:
    if (modoDefinirInicial) {
      fetch("http://localhost:8080/automatosregex/PostDefinirEstadoInicial", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: `x-NomeEstado=${encodeURIComponent(estado.nome)}`
      })
        .then((res) => {
          if (!res.ok) throw new Error("Erro ao definir estado inicial.");
          return res.json();
        })
        .then((data) => {
          alert(data.mensagem || "Estado inicial definido com sucesso.");

          // Atualiza o estado local
          setEstados(prev =>
            prev.map(e => ({
              ...e,
              isInicial: e.nome === estado.nome // ou use e.id se preferir
            }))
          );

          setModoDefinirInicial(false); // sair do modo
        })
        .catch((err) => {
          alert("Erro ao definir estado inicial.");
          console.error(err);
        });

      return; // não deixa fazer drag/transição nesse clique
    }

    // 👉 Se estiver definindo estado final:
    if (modoDefinirFinal) {
      fetch("http://localhost:8080/automatosregex/PostDefinirEstadoFinal", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: `x-NomeEstado=${encodeURIComponent(estado.nome)}`
      })
        .then((res) => {
          if (!res.ok) throw new Error("Erro ao definir estado final.");
          return res.json();
        })
        .then((data) => {
          alert(data.mensagem || "Estado final definido com sucesso.");

          // Atualiza o estado local
          setEstados(prev =>
            prev.map(e => ({
              ...e,
              isFinal: e.nome === estado.nome // ou use e.id se preferir
            }))
          );

          setModoDefinirFinal(false); // sair do modo
        })
        .catch((err) => {
          alert("Erro ao definir estado final.");
          console.error(err);
        });

      return;
    }


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

            setTransicoes((prev) => [...prev, novaTransicao]);
            setEstadoOrigemTransicao(null);
            setModoCriarTransicao(false);
          })
          .catch(() => {
            alert("Erro de conexão com o servidor.");
          });

        setEstadoOrigemTransicao(null);
        setModoCriarTransicao(false);
      }
      return;
    }

    // Arrastar estado
    setEstadoSelecionadoId(estado.id);
    const rect = containerRef.current!.getBoundingClientRect();
    dragOffset.current = {
      x: e.clientX - (estado.x + position.x + rect.left),
      y: e.clientY - (estado.y + position.y + rect.top),
    };
  };

//=====================================================================================================================================================================================================
//  VISUAL
//=====================================================================================================================================================================================================

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
        <svg
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: "100%",
            height: "100%",
            pointerEvents: "none", // permite cliques passarem para a div pai
          }}
        >
          {/* Definição do marcador de setas */}
          <defs>
            <marker
              id="arrowhead"
              markerWidth="10"
              markerHeight="7"
              refX="10"
              refY="3.5"
              orient="auto"
            >
              <polygon points="0 0, 10 3.5, 0 7" fill="black" />
            </marker>
          </defs>

          {/* Transições */}
          {transicoes.map((t, idx) => {
            const origem = estados.find(e => e.nome === t.origemNome);
            const destino = estados.find(e => e.nome === t.destinoNome);
            if (!origem || !destino) return null;

            const raio = 25;

            if (origem.id === destino.id) {
              // Auto-laço
              return (
                <g key={idx}>
                  <path
                    d={`
                      M ${origem.x} ${origem.y - raio}
                      C ${origem.x + 40} ${origem.y - 60},
                        ${origem.x - 40} ${origem.y - 60},
                        ${origem.x} ${origem.y - raio}
                    `}
                    stroke="black"
                    fill="none"
                    markerEnd="url(#arrowhead)"
                  />
                  <text
                    x={origem.x}
                    y={origem.y - raio - 65}
                    fontSize="14"
                    textAnchor="middle"
                  >
                    {t.simbolo}
                  </text>
                </g>
              );
            }

            // Transição entre estados diferentes
            const dx = destino.x - origem.x;
            const dy = destino.y - origem.y;
            const distancia = Math.sqrt(dx * dx + dy * dy);
            const normX = dx / distancia;
            const normY = dy / distancia;

            const x1 = origem.x + normX * raio;
            const y1 = origem.y + normY * raio;
            const x2 = destino.x - normX * raio;
            const y2 = destino.y - normY * raio;

            return (
              <g key={idx}>
                <line
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="black"
                  strokeWidth={2}
                  markerEnd="url(#arrowhead)"
                />
                <text
                  x={(x1 + x2) / 2}
                  y={(y1 + y2) / 2 - 5}
                  fontSize="14"
                  textAnchor="middle"
                >
                  {t.simbolo}
                </text>
              </g>
            );
          })}

          {/* Estados */}
          {estados.map((estado) => (
            <g
              key={estado.id}
              onMouseDown={(e) => handleMouseDownEstado(e as any, estado)}
              style={{ cursor: "pointer", pointerEvents: "auto" }}
            >
              {estado.isFinal && (
                <circle
                  cx={estado.x}
                  cy={estado.y}
                  r={30}
                  stroke="black"
                  fill="none"
                  strokeWidth={2}
                />
              )}

              <circle
                cx={estado.x}
                cy={estado.y}
                r={25}
                fill={estadoOrigemTransicao?.id === estado.id ? "#e0f7fa" : "#fff"}
                stroke={estadoOrigemTransicao?.id === estado.id ? "#2196f3" : "black"}
                strokeWidth={2}
              />

              {estado.isInicial && (
                <circle
                  cx={estado.x}
                  cy={estado.y}
                  r={16}
                  fill="none"
                  stroke="black"
                  strokeWidth={2}
                />
              )}

              <text
                x={estado.x}
                y={estado.y + 5}
                textAnchor="middle"
                fontWeight="bold"
                fontSize="14"
              >
                {estado.nome}
              </text>
            </g>

          ))}
        </svg>
      </div>
    </div>
  );
}

export default Canvas;
  