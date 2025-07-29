import React from "react";
import "./css/Sidebar.css";
//import stateGrey from "../assets/state-grey.png";
//import arrowGrey from "../assets/transition-grey.png";
//import endGrey from "../assets/end-grey.png"
//import startGrey from "../assets/start-grey.png"

import criarEstado from "../assets/criarEstado.png"
import criarTransicao from "../assets/criarTransicao.png"
import definirInicial from "../assets/definirInicial.png"
import definirFinal from "../assets/definirFinal.png"
import limpar from "../assets/limpar.png"

interface SidebarProps {
  onClickCriarEstado: () => void;
  onClickCriarTransicao: () => void;
  onClickLimparAutomato: () => void;
  onClickDefinirInicial: () => void;
  onClickDefinirFinal: () => void;
  onClickGerarRegex: () => void;
  modoCriarEstado: boolean;
  modoCriarTransicao: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({
  onClickCriarEstado,
  onClickCriarTransicao,
  onClickLimparAutomato,
  onClickDefinirInicial,
  onClickDefinirFinal,
  onClickGerarRegex,
  modoCriarEstado,
  modoCriarTransicao,
}) => {
  return (

    <div>

       <div className="sidebar">
        <button
          className={`tool-button ${modoCriarEstado ? "ativo" : ""}`}
          title="Criar estado"
          onClick={onClickCriarEstado}
        >
          <img className="icon-image" src={criarEstado} alt="Criar estado" />
        </button>

        <button
          className={`tool-button ${modoCriarTransicao ? "ativo" : ""}`}
          title="Posicionar transição"
          onClick={onClickCriarTransicao}
        >
          <img className="icon-image" src={criarTransicao} alt="Posicionar transição" />
        </button>

        <button
          className="tool-button"
          title="Definir estado inicial"
          onClick={onClickDefinirInicial}
        >
          <img className="icon-image" src={definirInicial} alt="Definir estado inicial" />
        </button>

        <button
          className="tool-button"
          title="Definir estado final"
          onClick={onClickDefinirFinal}
        >
          <img className="icon-image" src={definirFinal} alt="Definir estado final" />
        </button>

        <button
          className="tool-button"
          title="Limpar autômato"
          onClick={onClickLimparAutomato}
        >
          <img className="icon-image" src={limpar} alt="Limpar automato" />
        </button>

        {/* Adicione outros botões aqui se necessário */}

        <button
          className="botao-flutuante"
          onClick={onClickGerarRegex}
        >
          Converter para expressão regular
        </button>

      </div>

    </div>
    
  );
};

export default Sidebar;
