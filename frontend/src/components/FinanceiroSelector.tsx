import React, { useState, useEffect } from 'react';

const opcoes = [
  { label: 'Notas Emitidas', value: 'notas-emitidas' },
  { label: 'Recebimentos de NF', value: 'recebimentos-nf' },
  { label: 'Despesas', value: 'despesas' },
  { label: 'Dívidas/Obrigações', value: 'dividas-obrigacoes' },
  { label: 'Total/Notas', value: 'total-notas' },
  { label: 'Tributacoes', value: 'tributacoes' },


];

const API_URL = 'http://localhost:8000';

const FinanceiroSelector: React.FC = () => {
  const [abaSelecionada, setAbaSelecionada] = useState(opcoes[0].value);
  const [dados, setDados] = useState<any[]>([]);

  useEffect(() => {
    fetch(`${API_URL}/${abaSelecionada}`)
      .then(res => res.json())
      .then(data => setDados(data))
      .catch(err => console.error('Erro ao buscar dados:', err));
  }, [abaSelecionada]);

  return (
    <div style={{ maxWidth: 800, margin: '2rem auto', padding: '1rem', background: '#fff', borderRadius: 8 }}>
      <h2>Selecione a aba</h2>

      <select
        value={abaSelecionada}
        onChange={(e) => setAbaSelecionada(e.target.value)}
        style={{ padding: '0.5rem', marginBottom: '1rem', fontSize: '1rem' }}
      >
        {opcoes.map((opcao) => (
          <option key={opcao.value} value={opcao.value}>{opcao.label}</option>
        ))}
      </select>

      <pre style={{ background: '#f0f0f0', padding: '1rem', borderRadius: 4 }}>
        {JSON.stringify(dados, null, 2)}
      </pre>
    </div>
  );
};

export default FinanceiroSelector;
