import React, { useState, useEffect } from "react";
import Canvas from "./components/Canvas";
import Sidebar from "./components/Sidebar";
import type { Estado, Transicao } from "./components/Canvas";

const App: React.FC = () => {
  const [modoCriarEstado, setModoCriarEstado] = useState(false);
  const [modoCriarTransicao, setModoCriarTransicao] = useState(false);
  const [estados, setEstados] = useState<Estado[]>([]);
  const [transicoes, setTransicoes] = useState<Transicao[]>([]);
  const [contador, setContador] = useState(0);
  const [estadoOrigemTransicao, setEstadoOrigemTransicao] = useState<Estado | null>(null);
  const [modoDefinirInicial, setModoDefinirInicial] = useState(false);
  const [modoDefinirFinal, setModoDefinirFinal] = useState(false);
  const [regex, setRegex] = useState(""); // 👉 Novo estado para regex

  useEffect(() => {
    fetch("http://localhost:8080/automatosregex/GetAutomato")
      .then(async (response) => {
        if (!response.ok) {
          alert("Erro ao carregar autômato");
          return;
        }
        const data = await response.json();

        const estadosCarregados = data.estados.map((e: any, index: number) => ({
          id: index,
          nome: e.nome,
          x: e.x,
          y: e.y,
        }));

        setContador(estadosCarregados.length);

        const transicoesCarregadas = data.transicoes.map((t: any) => ({
          origemNome: t.estadoInicial || t.origemNome || t.estadoOrigem,
          destinoNome: t.estadoFinal || t.destinoNome || t.estadoDestino,
          simbolo: t.expressao || t.simbolo,
        }));

        setEstados(estadosCarregados);
        setTransicoes(transicoesCarregadas);
      })
      .catch(() => {
        alert("Erro de conexão ao carregar autômato");
      });
  }, []);

  // 👉 Função para buscar expressão regular
  const buscarRegex = () => {
    fetch("http://localhost:8080/automatosregex/GetExpressaoRegular")
      .then((res) => res.text()) // muda para .text() já que é string pura
      .then((texto) => {
        setRegex(texto || "Expressão não encontrada");
      })
      .catch(() => {
        setRegex("Erro ao buscar expressão regular");
      });
  };


  return (
    <>
      <Sidebar
        onClickCriarEstado={() => { setModoCriarEstado(true); setModoCriarTransicao(false); }}
        onClickCriarTransicao={() => { setModoCriarEstado(false); setModoCriarTransicao(true); }}
        onClickLimparAutomato={() => {
          if (!window.confirm("Tem certeza que deseja limpar o autômato?")) return;
          fetch("http://localhost:8080/automatosregex/PostLimparTela", { method: "POST" })
            .then((res) => {
              if (!res.ok) throw new Error("Erro ao limpar no backend");
              setEstados([]);
              setTransicoes([]);
              setContador(0);
              setEstadoOrigemTransicao(null);
              setRegex(""); // também limpa regex
              alert("Autômato limpo com sucesso.");
            })
            .catch(() => alert("Erro ao limpar autômato."));
        }}
        onClickDefinirInicial={() => {
          setModoCriarEstado(false);
          setModoCriarTransicao(false);
          setModoDefinirInicial(true);
        }}
        onClickDefinirFinal={() => {
          setModoDefinirFinal(true);
          setModoCriarEstado(false);
          setModoCriarTransicao(false);
          setModoDefinirInicial(false);
        }}
        modoCriarEstado={modoCriarEstado}
        modoCriarTransicao={modoCriarTransicao}
        onClickGerarRegex={buscarRegex}
      />

      <Canvas
        modoCriarEstado={modoCriarEstado}
        setModoCriarEstado={setModoCriarEstado}
        modoCriarTransicao={modoCriarTransicao}
        setModoCriarTransicao={setModoCriarTransicao}
        modoDefinirInicial={modoDefinirInicial}
        setModoDefinirInicial={setModoDefinirInicial}
        modoDefinirFinal={modoDefinirFinal}
        setModoDefinirFinal={setModoDefinirFinal}
        onClickLimparAutomato={() => {}}
        estados={estados}
        setEstados={setEstados}
        transicoes={transicoes}
        setTransicoes={setTransicoes}
        contador={contador}
        setContador={setContador}
        estadoOrigemTransicao={estadoOrigemTransicao}
        setEstadoOrigemTransicao={setEstadoOrigemTransicao}
      />

      {/* ✅ Botão + exibição da expressão regular */}
      <div style={{ margin: "20px", textAlign: "center" }}>
        <button className="botao-flutuante" onClick={buscarRegex}>
          Converter para expressão regular
        </button>

        {/* ✅ Área fixa no rodapé para mostrar a expressão */}
        <div style={{
          position: "fixed",
          bottom: "3vh",
          left: "50%",
          transform: "translateX(-50%)",
          background: "#fff",
          padding: "10px 20px",
          borderRadius: "10px",
          boxShadow: "0 4px 8px rgba(0,0,0,0.3)",
          fontSize: "16px",
          fontFamily: "monospace",
          color: "#801FFF",
          zIndex: 1000,
          minWidth: "300px",
          textAlign: "center"
        }}>
          {regex ? `${regex}` : "Expressão ainda não gerada"}
        </div>

      </div>
    </>
  );
};

export default App;
