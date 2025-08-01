import React, { useEffect, useState } from 'react';
import './Tributacoes.css';

const Tributacoes = () => {
  const [notas, setNotas] = useState([]);
  const [tributacoes, setTributacoes] = useState([]);
  const [tributo, setTributo] = useState({
    nota_fiscal_id: '',
    tipo: '',
    percentual: '',
    data: new Date().toISOString().split('T')[0],
  });

  const fetchNotas = () => {
    fetch('http://localhost:8000/notas-emitidas')
      .then(res => res.json())
      .then(data => {
        const pendentes = data.filter(nota => nota.valor_pendente > 0);
        setNotas(pendentes);
      });
  };

  const fetchTributacoes = () => {
    fetch('http://localhost:8000/tributacoes')
      .then(res => res.json())
      .then(data => setTributacoes(data));
  };

  useEffect(() => {
    fetchNotas();
    fetchTributacoes();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTributo({ ...tributo, [name]: value });
  };

  const aplicarTributo = async (e) => {
    e.preventDefault();

    const payload = {
      nota_fiscal_id: tributo.nota_fiscal_id, // Envie string mesmo!
      tipo: tributo.tipo,
      percentual: parseFloat(tributo.percentual),
      data: tributo.data
    };


    try {
      const res = await fetch('http://localhost:8000/tributacoes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (res.ok) {
        alert('Tributação aplicada com sucesso!');
        setTributo({
          nota_fiscal_id: '',
          tipo: '',
          percentual: '',
          data: new Date().toISOString().split('T')[0],
        });
        fetchNotas(); // Atualiza a lista de notas
        fetchTributacoes(); // Atualiza a lista de tributações
      } else {
        alert(json.detail || 'Erro ao aplicar tributo');
      }
    } catch (err) {
      alert('Erro de conexão com o servidor');
    }
  };

  const calcularValorEstimado = () => {
    const nota = notas.find(n => n.id === tributo.nota_fiscal_id);
    if (nota && tributo.percentual) {
      const valorBase = nota.valor_pendente;
      return ((valorBase * parseFloat(tributo.percentual)) / 100).toFixed(2);
    }
    return '0.00';
  };

  return (
    <div className="tributacao-container">
      <h2>Tributações</h2>

      <form className="tributo-form" onSubmit={aplicarTributo}>
        <label htmlFor="nota_fiscal_id">Selecionar Nota</label>
        <select
          name="nota_fiscal_id"
          value={tributo.nota_fiscal_id}
          onChange={handleChange}
          required
        >
          <option value="">Selecione uma nota</option>
          {notas.map(n => (
            <option key={n.id} value={n.id}>
              NF {n.numero_nf} - R$ {n.valor_pendente.toFixed(2)}
            </option>

          ))}
        </select>


        <label htmlFor="tipo">Tipo de Tributo</label>
        <select
          name="tipo"
          value={tributo.tipo}
          onChange={handleChange}
          required
        >
          <option value="">Selecione o tipo</option>
          <option value="ISS">ISS</option>
          <option value="IR">IR</option>
          <option value="CSLL">CSLL</option>
          <option value="COFINS">COFINS</option>
          <option value="PIS">PIS</option>
        </select>

        <label htmlFor="percentual">Percentual (%)</label>
        <input
          name="percentual"
          type="number"
          step="0.01"
          value={tributo.percentual}
          onChange={handleChange}
          required
        />

        <label htmlFor="data">Data da Tributação</label>
        <input
          type="date"
          name="data"
          value={tributo.data}
          onChange={handleChange}
          required
        />

        <div className="valor-estimado">
          Valor estimado: <strong>R$ {calcularValorEstimado()}</strong>
        </div>

        <button type="submit">Aplicar Tributação</button>
      </form>

      <h3 className="subtitulo">Tributações Aplicadas</h3>
      <table className="tabela-tributacoes">
        <thead>
          <tr>
            <th>Número NF</th>
            <th>Tipo</th>
            <th>Percentual (%)</th>
            <th>Valor (R$)</th>
            <th>Data</th>
          </tr>
        </thead>
        <tbody>
          {tributacoes.map((t, index) => {
            // Prioriza mostrar o número da nota, se possível
            let numero_nf = t.nota_fiscal_id;
            const notaRef = notas.find(n => n.id === t.nota_fiscal_id);
            if (notaRef) numero_nf = notaRef.numero_nf;
            if (t.numero_nf) numero_nf = t.numero_nf; // se backend retornar!
            return (
              <tr key={index}>
                <td>{numero_nf}</td>
                <td>{t.tipo}</td>
                <td>{t.percentual}%</td>
                <td>R$ {t.valor?.toFixed(2)}</td>
                <td>{t.data ? new Date(t.data).toLocaleDateString() : '—'}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default Tributacoes;
