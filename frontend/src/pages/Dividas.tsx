import React, { useEffect, useState } from 'react';
import './Dividas.css';

const Dividas = () => {
  const [dividas, setDividas] = useState<any[]>([]);
  const [novaDivida, setNovaDivida] = useState({
    id: '',         // string!
    credor: '',
    descricao: '',
    data_vencimento: '',
    valor: '',
    foi_pago: false
  });


  useEffect(() => {
    fetchDividas();
  }, []);

  const fetchDividas = () => {
    fetch('http://localhost:8000/dividas-obrigacoes')
      .then(res => res.json())
      .then(data => setDividas(data));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setNovaDivida({
      ...novaDivida,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    fetch('http://localhost:8000/dividas-obrigacoes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        credor: novaDivida.credor,
        descricao: novaDivida.descricao,
        data_vencimento: novaDivida.data_vencimento,
        valor: parseFloat(novaDivida.valor),
        foi_pago: novaDivida.foi_pago
      })
    })

      .then(res => res.json())
      .then(() => {
        fetchDividas();
        setNovaDivida({
          id: '',
          credor: '',
          descricao: '',
          data_vencimento: '',
          valor: '',
          foi_pago: false
        });

      });
  };

  return (
    <div className="dividas-container">
      <h2>Dívidas e Obrigações</h2>

      <form className="divida-form" onSubmit={handleSubmit}>
        <input
          name="credor"
          placeholder="Credor"
          value={novaDivida.credor}
          onChange={handleChange}
          required
        />
        <input
          name="descricao"
          placeholder="Descrição"
          value={novaDivida.descricao}
          onChange={handleChange}
          required
        />
        <input
          name="data_vencimento"
          type="date"
          value={novaDivida.data_vencimento}
          onChange={handleChange}
          required
        />
        <input
          name="valor"
          type="number"
          placeholder="Valor"
          value={novaDivida.valor}
          onChange={handleChange}
          required
        />
        <label>
          <input
            type="checkbox"
            name="foi_pago"
            checked={novaDivida.foi_pago}
            onChange={handleChange}
          />
          Pago?
        </label>
        <button type="submit">Salvar</button>
      </form>

      <table className="dividas-table">
        <thead>
          <tr>
            <th>Credor</th>
            <th>Descrição</th>
            <th>Vencimento</th>
            <th>Valor</th>
            <th>Pago?</th>
          </tr>
        </thead>
        <tbody>
          {dividas.map((divida) => (
            <tr key={divida.id}>
              <td>{divida.credor}</td>
              <td>{divida.descricao}</td>
              <td>{divida.data_vencimento.split('-').reverse().join('/')}</td>
              <td>R$ {divida.valor.toFixed(2)}</td>
              <td className={divida.foi_pago ? "status-paid" : "status-unpaid"}>
                {divida.foi_pago ? "🟢" : "🔴"}
              </td>

            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Dividas;
