// src/components/Sidebar.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = () => {
  return (
    <div className="sidebar">
      <h2>Recrinanceiro</h2>
      <nav>
        <ul>
          <li><Link to="/">Dashboard</Link></li>
          <br></br>
          <li><Link to="/notas-emitidas">Notas Emitidas</Link></li>
          <li><Link to="/tributacoes">Tributações</Link></li>
          <li><Link to="/recebimentos-nf">Recebimentos NF</Link></li>
          <li><Link to="/total-notas">Total de Notas</Link></li>
          <br></br>
          <li><Link to="/despesas">Despesas</Link></li>
          <li><Link to="/dividas-obrigacoes">Dívidas e Obrigações</Link></li>
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;
