import React from "react";
import "./css/Sidebar.css";
import stateGrey from "../assets/state-grey.png";
import arrowGrey from "../assets/transition-grey.png";

interface SidebarProps {
  onClickCriarEstado: () => void;
  onClickCriarTransicao: () => void;
  onClickLimparAutomato: () => void;
  modoCriarEstado: boolean;
  modoCriarTransicao: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({
  onClickCriarEstado,
  onClickCriarTransicao,
  onClickLimparAutomato,
  modoCriarEstado,
  modoCriarTransicao,
}) => {
  return (
    <div className="sidebar">
      <button
        className={`tool-button ${modoCriarEstado ? "ativo" : ""}`}
        title="Criar estado"
        onClick={onClickCriarEstado}
      >
        <img className="icon-image" src={stateGrey} alt="Criar estado" />
      </button>

      <button
        className={`tool-button ${modoCriarTransicao ? "ativo" : ""}`}
        title="Posicionar transição"
        onClick={onClickCriarTransicao}
      >
        <img className="icon-image" src={arrowGrey} alt="Posicionar transição" />
      </button>

      <button
        className="tool-button"
        title="Limpar autômato"
        onClick={onClickLimparAutomato}
      >
        <img className="icon-image"  alt="Limpar" />
      </button>

      {/* Adicione outros botões aqui se necessário */}
    </div>
  );
};

export default Sidebar;
