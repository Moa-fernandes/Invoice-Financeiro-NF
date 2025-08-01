import React, { useEffect, useState } from 'react';
import './Despesas.css';

const Despesas = () => {
  const [despesas, setDespesas] = useState<any[]>([]);
  const [novaDespesa, setNovaDespesa] = useState({
  id: '',    // string!
  descricao: '',
  categoria: '',
  data_pagamento: '',
  valor: ''
});

  useEffect(() => {
    fetchDespesas();
  }, []);

  const fetchDespesas = () => {
    fetch('http://localhost:8000/despesas')
      .then(res => res.json())
      .then(data => setDespesas(data));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNovaDespesa({ ...novaDespesa, [name]: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    fetch('http://localhost:8000/despesas', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    descricao: novaDespesa.descricao,
    categoria: novaDespesa.categoria,
    data_pagamento: novaDespesa.data_pagamento,
    valor: parseFloat(novaDespesa.valor)
  })
})

      .then(res => res.json())
      .then(() => {
        fetchDespesas();
        setNovaDespesa({
  id: '',
  descricao: '',
  categoria: '',
  data_pagamento: '',
  valor: ''
});

      });
  };

  return (
    <div className="despesas-container">
      <h2>Despesas</h2>

      <form className="despesa-form" onSubmit={handleSubmit}>
        <input
          name="descricao"
          placeholder="Descrição"
          value={novaDespesa.descricao}
          onChange={handleChange}
          required
        />
        <input
          name="categoria"
          placeholder="Categoria"
          value={novaDespesa.categoria}
          onChange={handleChange}
          required
        />
        <input
          name="data_pagamento"
          type="date"
          value={novaDespesa.data_pagamento}
          onChange={handleChange}
          required
        />
        <input
          name="valor"
          type="number"
          placeholder="Valor"
          value={novaDespesa.valor}
          onChange={handleChange}
          required
        />
        <button type="submit">Salvar</button>
      </form>

      <table className="despesas-table">
        <thead>
          <tr>
            <th>Descrição</th>
            <th>Categoria</th>
            <th>Data de Pagamento</th>
            <th>Valor</th>
          </tr>
        </thead>
        <tbody>
          {despesas.map((despesa) => (
            <tr key={despesa.id}>
              <td>{despesa.descricao}</td>
              <td>{despesa.categoria}</td>
              <td>{despesa.data_pagamento.split('-').reverse().join('/')}</td>
              <td>R$ {despesa.valor.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Despesas;
