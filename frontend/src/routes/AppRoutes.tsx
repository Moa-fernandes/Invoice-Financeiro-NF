import { Routes, Route } from 'react-router-dom';
import Dashboard from '../pages/Dashboard';
import NotasEmitidas from '../pages/NotasEmitidas';
import RecebimentosNF from '../pages/RecebimentosNF';
import Despesas from '../pages/Despesas';
import Dividas from '../pages/Dividas';
import TotalNotas from '../pages/TotalNotas';
import Tributacoes from '../pages/Tributacoes';




const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/notas-emitidas" element={<NotasEmitidas />} />
      <Route path="/recebimentos-nf" element={<RecebimentosNF />} />
      <Route path="/despesas" element={<Despesas />} />
      <Route path="/dividas-obrigacoes" element={<Dividas />} />
      <Route path="/total-notas" element={<TotalNotas />} />
      <Route path="/tributacoes" element={<Tributacoes />} />


    </Routes>
  );
};

export default AppRoutes;
