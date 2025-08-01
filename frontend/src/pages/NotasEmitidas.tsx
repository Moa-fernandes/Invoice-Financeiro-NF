import React, { useEffect, useState } from 'react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { FaFileExcel } from 'react-icons/fa'; // ← Importação corrigida
import './NotasEmitidas.css';
import { MdEdit, MdDelete } from 'react-icons/md';



const NotasEmitidas = () => {
  const [notas, setNotas] = useState<any[]>([]);
  const [novaNota, setNovaNota] = useState({
    id: 0,
    numero_nf: '',
    data_real: '', // ← novo campo
    data_emissao: '',
    valor: '',
    paciente: '',
    servico: ''
  });

  const [glosa, setGlosa] = useState({
    nota_id: '',
    valor_glosa: '',
    data_glosa: ''
  });

  // ESTADO PARA EDIÇÃO
  const [editandoId, setEditandoId] = useState<number | null>(null);

  useEffect(() => {
    fetchNotas();
  }, []);

  const fetchNotas = () => {
    fetch('http://localhost:8000/notas-emitidas')
      .then(res => res.json())
      .then(data => setNotas(data));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNovaNota({ ...novaNota, [name]: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editandoId) {
      // PUT (EDIÇÃO)
      fetch(`http://localhost:8000/notas-emitidas/${editandoId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...novaNota,
          valor: parseFloat(novaNota.valor),
          id: editandoId
        })
      })
        .then(res => res.json())
        .then(() => {
          fetchNotas();
          setNovaNota({
            id: 0,
            numero_nf: '',
            data_real: '',
            data_emissao: '',
            valor: '',
            paciente: '',
            servico: ''
          });
          setEditandoId(null);
        });
    } else {
      // POST (NOVA)
      fetch('http://localhost:8000/notas-emitidas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...novaNota,
          valor: parseFloat(novaNota.valor),
          id: Math.floor(Math.random() * 10000)
        })
      })
        .then(res => res.json())
        .then(() => {
          fetchNotas();
          setNovaNota({
            id: 0,
            numero_nf: '',
            data_real: '',
            data_emissao: '',
            valor: '',
            paciente: '',
            servico: ''
          });
        });
    }
  };

  const handleEditar = (nota: any) => {
    setNovaNota({
      id: nota.id,
      numero_nf: nota.numero_nf,
      data_real: nota.data_real,
      data_emissao: nota.data_emissao,
      valor: nota.valor,
      paciente: nota.paciente,
      servico: nota.servico
    });
    setEditandoId(nota.id);
    window.scrollTo(0, 0);
  };

  const handleCancelarEdicao = () => {
    setNovaNota({
      id: 0,
      numero_nf: '',
      data_real: '',
      data_emissao: '',
      valor: '',
      paciente: '',
      servico: ''
    });
    setEditandoId(null);
  };

  const handleExcluir = (id: number) => {
    if (!window.confirm("Tem certeza que deseja excluir esta nota?")) return;
    fetch(`http://localhost:8000/notas-emitidas/${id}`, {
      method: 'DELETE'
    })
      .then(() => fetchNotas());
  };

  const handleGlosaChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setGlosa({ ...glosa, [name]: value });
  };

  const handleGlosaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!glosa.nota_id || !glosa.valor_glosa) return alert("Preencha todos os campos.");

    const payload = {
      nota_id: glosa.nota_id, // ← id do Mongo como string!
      valor_glosa: parseFloat(glosa.valor_glosa),
      data_glosa: glosa.data_glosa || new Date().toISOString().split('T')[0]
    };

    await fetch('http://localhost:8000/glosas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    setGlosa({ nota_id: '', valor_glosa: '', data_glosa: '' });
    fetchNotas();
  };



  const getStatusClass = (pendente: number) => {
    if (pendente <= 0) return 'status-quitada';
    if (pendente > 0 && pendente < 1) return 'status-parcial';
    return 'status-pendente';
  };

  const exportarNotaParaExcel = (nota: any) => {
    const worksheet = XLSX.utils.json_to_sheet([{
      ID: nota.id,
      'Número NF': nota.numero_nf,
      'Data Real': nota.data_real ? nota.data_real.split('-').reverse().join('/') : '',
      'Data Registro': nota.data_emissao ? nota.data_emissao.split('-').reverse().join('/') : '',
      'Valor Total': nota.valor,
      'Valor Recebido': nota.valor_recebido,
      'Valor Glosa': nota.valor_glosa,
      'Valor Tributado': nota.valor_tributado,
      'Valor Pendente': nota.valor_pendente,
      Paciente: nota.paciente,
      Serviço: nota.servico
    }]);

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Nota');

    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });

    saveAs(blob, `nota_${nota.numero_nf}.xlsx`);
  };

  return (
    <div className="tela-container">
      <h2>Notas Emitidas</h2>

      <form className="nota-form" onSubmit={handleSubmit}>
        {/* ...seus campos... */}
        <div className="campo">
          <label htmlFor="numero_nf">Número NF:</label>
          <input id="numero_nf" name="numero_nf" placeholder="Número NF" value={novaNota.numero_nf} onChange={handleChange} required />
        </div>
        <div className="campo">
          <label htmlFor="data_real">Data Original NF:</label>
          <input id="data_real" name="data_real" type="date" value={novaNota.data_real} onChange={handleChange} required />
        </div>

        <div className="campo">
          <label htmlFor="data_emissao">Data Registro NF:</label>
          <input id="data_emissao" name="data_emissao" type="date" value={novaNota.data_emissao} onChange={handleChange} required />
        </div>

        <div className="campo">
          <label htmlFor="valor">Valor:</label>
          <input id="valor" name="valor" type="number" placeholder="Valor" value={novaNota.valor} onChange={handleChange} required />
        </div>
        <div className="campo">
          <label htmlFor="paciente">Paciente:</label>
          <input id="paciente" name="paciente" placeholder="Paciente" value={novaNota.paciente} onChange={handleChange} required />
        </div>
        <div className="campo">
          <label htmlFor="servico">Serviço:</label>
          <input id="servico" name="servico" placeholder="Serviço" value={novaNota.servico} onChange={handleChange} required />

        </div>

        <button type="submit">{editandoId ? 'Salvar Edição' : 'Salvar Nota'}</button>
        {editandoId && (
          <button type="button" onClick={handleCancelarEdicao} style={{ background: "#f44336", color: "#fff", marginLeft: 10 }}>
            Cancelar
          </button>
        )}
      </form>

      <table>
        <thead>
          <tr>
            <th>Número NF</th>
            <th>Data NF</th>
            <th>Data Registro</th>
            <th>Valor Total</th>
            <th>Recebido</th>
            <th>Glosa</th>
            <th>Tributado</th>
            <th>Pendente</th>
            <th>Paciente</th>
            <th>Serviço</th>
            <th>Excel</th>
            <th>Ações</th> {/* NOVA COLUNA */}
          </tr>
        </thead>
        <tbody>
          {notas.map((nota) => (
            <tr key={nota.id} className={getStatusClass(nota.valor_pendente)}>
              <td>{nota.numero_nf}</td>
              <td>{nota.data_real ? nota.data_real.split('-').reverse().join('/') : ''}</td>
              <td>{nota.data_emissao ? nota.data_emissao.split('-').reverse().join('/') : ''}</td>
              <td>R$ {nota.valor.toFixed(2)}</td>
              <td>R$ {(nota.valor_recebido ?? 0).toFixed(2)}</td>
              <td>R$ {(nota.valor_glosa ?? 0).toFixed(2)}</td>
              <td>R$ {(nota.valor_tributado ?? 0).toFixed(2)}</td>
              <td>R$ {(nota.valor_pendente ?? 0).toFixed(2)}</td>

              <td>{nota.paciente}</td>
              <td>{nota.servico}</td>
              <td style={{ textAlign: 'center' }}>
                <button title="Exportar para Excel" onClick={() => exportarNotaParaExcel(nota)} className="btn-excel">
                  <FaFileExcel size={18} color="#2e7d32" />
                </button>
              </td>
              <td>
                <button className="btn-acao" title="Editar" onClick={() => handleEditar(nota)}><MdEdit size={20} /></button>
                <button className="btn-acao" title="Excluir" onClick={() => handleExcluir(nota.id)}><MdDelete size={20} /></button>

              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3>Registrar Glosa</h3>
      <form className="glosa-form" onSubmit={handleGlosaSubmit}>
        <select name="nota_id" value={glosa.nota_id} onChange={handleGlosaChange} required>
          <option value="">Selecione a Nota</option>
          {notas.map(n => (
            <option key={n.id} value={n.id}>
              {n.numero_nf} - R$ {(n.valor_pendente ?? 0).toFixed(2)} pendente
            </option>
          ))}
        </select>
        <input type="date" name="data_glosa" value={glosa.data_glosa} onChange={handleGlosaChange} />
        <input type="number" name="valor_glosa" placeholder="Valor da Glosa" value={glosa.valor_glosa} onChange={handleGlosaChange} required />
        <button type="submit">Aplicar Glosa</button>
      </form>

    </div>
  );
};

export default NotasEmitidas;
