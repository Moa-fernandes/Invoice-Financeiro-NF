import React, { useEffect, useState } from 'react';
import './NotasEmitidas.css';

interface Nota {
  id: string; // <-- id agora é string!
  numero_nf: string;
  valor: number;
  valor_recebido: number;
  valor_glosa: number;
  valor_pendente: number;
  paciente?: string;
}

interface Recebimento {
  id?: string;
  nota_fiscal_id: string;  // <-- string!
  data_recebimento: string;
  valor_recebido: number;
  forma_pagamento: string;
}


const RecebimentosNF = () => {
  const [notas, setNotas] = useState<Nota[]>([]);
  const [recebimentos, setRecebimentos] = useState<Recebimento[]>([]);
  const [novo, setNovo] = useState({
    nota_fiscal_id: '',
    data_recebimento: '',
    valor_recebido: '',
    forma_pagamento: ''
  });


  useEffect(() => {
    fetchNotas();
    fetchRecebimentos();
  }, []);

  const fetchNotas = () => {
    fetch('http://localhost:8000/notas-emitidas')
      .then(res => res.json())
      .then(data => setNotas(data));
  };

  const fetchRecebimentos = () => {
    fetch('http://localhost:8000/recebimentos-nf')
      .then(res => res.json())
      .then(data => setRecebimentos(data));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNovo({ ...novo, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const notaSelecionada = notas.find(n => n.id === novo.nota_fiscal_id);
    if (!notaSelecionada) {
      alert("Nota não encontrada.");
      return;
    }

    const valorNovo = parseFloat(novo.valor_recebido);
    if (valorNovo > notaSelecionada.valor_pendente) {
      alert(`Valor excede o disponível da nota (R$ ${notaSelecionada.valor_pendente.toFixed(2)}).`);
      return;
    }

    const payload = {
      nota_fiscal_id: novo.nota_fiscal_id, // string!
      data_recebimento: novo.data_recebimento,
      valor_recebido: parseFloat(novo.valor_recebido),
      forma_pagamento: novo.forma_pagamento
    };


    await fetch('http://localhost:8000/recebimentos-nf', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    fetchRecebimentos();
    fetchNotas();

    setNovo({
      nota_fiscal_id: '',
      data_recebimento: '',
      valor_recebido: '',
      forma_pagamento: ''
    });

  };

  return (
    <div className="tela-container">
      <h2>Recebimentos de Notas Fiscais</h2>

      <form className="nota-form" onSubmit={handleSubmit}>
        <select name="nota_fiscal_id" value={novo.nota_fiscal_id} onChange={handleChange} required>
          <option value="">Selecione a NF</option>
          {notas.map(nota => (
            <option key={nota.id} value={nota.id}>
              {nota.numero_nf} - {nota.paciente} - R$ {nota.valor_pendente?.toFixed(2)} pendente
            </option>
          ))}
        </select>


        <input type="date" name="data_recebimento" value={novo.data_recebimento} onChange={handleChange} required />
        <input type="number" name="valor_recebido" placeholder="Valor Recebido" value={novo.valor_recebido} onChange={handleChange} required />
        <input name="forma_pagamento" placeholder="Forma de Pagamento" value={novo.forma_pagamento} onChange={handleChange} required />
        <button type="submit">Salvar Recebimento</button>
      </form>

      <table>
        <thead>
          <tr>
            <th>Nota Fiscal</th>
            <th>Data</th>
            <th>Valor</th>
            <th>Pagamento</th>
          </tr>
        </thead>
        <tbody>
          {recebimentos.map(r => {
            const nf = notas.find(n => n.id === r.nota_fiscal_id);
            return (
              <tr key={r.id}>
                <td>{nf?.numero_nf || r.nota_fiscal_id}</td>
                <td>{r.data_recebimento.split('-').reverse().join('/')}</td>
                <td>R$ {Number(r.valor_recebido).toFixed(2)}</td>
                <td>{r.forma_pagamento}</td>
              </tr>
            );
          })}

        </tbody>
      </table>
    </div>
  );
};

export default RecebimentosNF;
