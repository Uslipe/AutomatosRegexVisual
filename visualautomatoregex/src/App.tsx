import React, { useState } from "react";
import Canvas from "./components/Canvas";
import Sidebar from "./components/Sidebar";

const App: React.FC = () => {
  const [modoCriarEstado, setModoCriarEstado] = useState(false);
  const [modoCriarTransicao, setModoCriarTransicao] = useState(false);

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

  return (
    <>
      <Sidebar
        onClickCriarEstado={ativarModoCriarEstado}
        onClickCriarTransicao={ativarModoCriarTransicao}
        modoCriarEstado={modoCriarEstado}
        modoCriarTransicao={modoCriarTransicao}
      />

      <Canvas
        modoCriarEstado={modoCriarEstado}
        setModoCriarEstado={setModoCriarEstado}
      />
    </>
  );
};

export default App;
