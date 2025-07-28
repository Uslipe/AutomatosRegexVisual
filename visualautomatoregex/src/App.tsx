import React, { useState } from "react";
import Canvas from "./components/Canvas";
import Sidebar from "./components/Sidebar";

const App: React.FC = () => {
  const [modoCriarEstado, setModoCriarEstado] = useState(false);
  const [modoCriarTransicao, setModoCriarTransicao] = useState(false);
  const [estados, setEstados] = useState<any[]>([]);
  const [transicoes, setTransicoes] = useState<any[]>([]);
  const [contador, setContador] = useState<number>(0);
  const [estadoOrigemTransicao, setEstadoOrigemTransicao] = useState<any>(null);


  // Ativa modo criar estado e desativa criar transição
  const ativarModoCriarEstado = () => {
    setModoCriarEstado(true);
    setModoCriarTransicao(false);
  };

  // Ativa modo criar transição e desativa criar estado
  const ativarModoCriarTransicao = () => {
    setModoCriarEstado(false);
    setModoCriarTransicao(true);
  };

  const limparAutomato = () => {
      if (!window.confirm("Tem certeza que deseja limpar o autômato?")) return;

      fetch("http://localhost:8080/automatosregex/PostLimparTela", {
        method: "POST",
      })
        .then((res) => {
          if (!res.ok) throw new Error("Erro ao limpar no backend");

          //Limpa frontend também
          setEstados([]);
          setTransicoes([]);
          setContador(0);
          setEstadoOrigemTransicao(null);
          alert("Autômato limpo com sucesso.");
        })
        .catch(() => alert("Erro ao limpar autômato."));
    };


  return (
    <>
      <Sidebar
        onClickCriarEstado={ativarModoCriarEstado}
        onClickCriarTransicao={ativarModoCriarTransicao}
        onClickLimparAutomato={limparAutomato}
        modoCriarEstado={modoCriarEstado}
        modoCriarTransicao={modoCriarTransicao}
      />

      <Canvas
        modoCriarEstado={modoCriarEstado}
        setModoCriarEstado={setModoCriarEstado}
        modoCriarTransicao={modoCriarTransicao}
        setModoCriarTransicao={setModoCriarTransicao}
        onClickLimparAutomato={limparAutomato}
      />
    </>
  );
};

export default App;
