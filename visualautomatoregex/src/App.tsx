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

  // UseEffect para carregar o autômato ao montar o componente
  useEffect(() => {
    fetch("http://localhost:8080/automatosregex/GetAutomato")
      .then(async (response) => {
        if (!response.ok) {
          alert("Erro ao carregar autômato");
          return;
        }
        const data = await response.json();

        // data deve ter a forma { estados: [...], transicoes: [...] }
        // Mapear os estados do backend para o formato Estado do frontend:
        const estadosCarregados = data.estados.map((e: any, index: number) => ({
          id: index,       // pode usar índice, ou se backend enviar id, usar esse
          nome: e.nome,
          x: e.x,
          y: e.y,
          // se tiver isFinal ou isInicial e quiser, pode colocar aqui
        }));

        // Ajustar o contador para evitar ids duplicados
        setContador(estadosCarregados.length);

        // Mapear as transições:
        const transicoesCarregadas = data.transicoes.map((t: any) => ({
          origemNome: t.estadoInicial || t.origemNome || t.estadoOrigem,
          destinoNome: t.estadoFinal || t.destinoNome || t.estadoDestino,
          simbolo: t.expressao || t.simbolo,
        }));

        setEstados(estadosCarregados);
        setTransicoes(transicoesCarregadas);

        console.log("Estados carregados:", estadosCarregados);
        console.log("Transições carregadas:", transicoesCarregadas);

      })
      .catch(() => {
        alert("Erro de conexão ao carregar autômato");
      });

  }, []); // Executa só 1 vez no mount

  // ... seus outros handlers e funções

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
              alert("Autômato limpo com sucesso.");
            })
            .catch(() => alert("Erro ao limpar autômato."));
        }}
        modoCriarEstado={modoCriarEstado}
        modoCriarTransicao={modoCriarTransicao}
      />

      <Canvas
        modoCriarEstado={modoCriarEstado}
        setModoCriarEstado={setModoCriarEstado}
        modoCriarTransicao={modoCriarTransicao}
        setModoCriarTransicao={setModoCriarTransicao}
        onClickLimparAutomato={() => {/* opcional: delega para o pai */}}
        // Passe estados e transicoes para o Canvas para renderizar
        estados={estados}
        setEstados={setEstados}
        transicoes={transicoes}
        setTransicoes={setTransicoes}
        contador={contador}
        setContador={setContador}
        estadoOrigemTransicao={estadoOrigemTransicao}
        setEstadoOrigemTransicao={setEstadoOrigemTransicao}
      />
    </>
  );
};

export default App;
