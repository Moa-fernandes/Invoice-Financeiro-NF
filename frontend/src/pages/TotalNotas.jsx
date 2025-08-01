import React, { useEffect, useState } from 'react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { FaFileExcel } from 'react-icons/fa';
import './TotalNotas.css';

const TotalNotas = () => {
    const [notasQuitadas, setNotasQuitadas] = useState([]);
    const [recebimentos, setRecebimentos] = useState([]);
    const [glosas, setGlosas] = useState([]);

    useEffect(() => {
        Promise.all([
            fetch('http://localhost:8000/notas-emitidas').then(res => res.json()),
            fetch('http://localhost:8000/recebimentos-nf').then(res => res.json()),
            fetch('http://localhost:8000/glosas')
                .then(res => res.json())
                .catch(() => [])
        ]).then(([notas, receb, glosasData]) => {
            const quitadas = notas.filter(nota => nota.valor_pendente <= 0);
            setNotasQuitadas(quitadas);
            setRecebimentos(receb);
            setGlosas(glosasData);
        });

    }, []);

    const exportarNotaCompleta = (nota) => {
        const recebimentosNota = recebimentos.filter(r => r.nota_fiscal_id === nota.id);
        const glosasDaNota = glosas.filter(g => g.nota_id === nota.id);

        const glosaNota = glosasDaNota.reduce((acc, g) => acc + g.valor_glosa, 0);

        const formatarData = (iso) =>
            iso ? iso.split('-').reverse().join('/') : '';

        const rows = [];

        // Adiciona recebimentos
        recebimentosNota.forEach((rec, index) => {
            rows.push({
                "NF Nº": nota.numero_nf,
                "Paciente": nota.paciente,
                "Serviço": nota.servico,
                "Data Real NF": formatarData(nota.data_real),
                "Data Registro": formatarData(nota.data_emissao),
                "Valor Total": nota.valor,
                "Recebimento Nº": index + 1,
                "Data Recebimento": formatarData(rec.data_recebimento),
                "Valor Recebido": rec.valor_recebido,
                "Forma Pagamento": rec.forma_pagamento,
                "Glosa Aplicada": index === 0 ? glosaNota : '',
                "Data Glosa": '',
                "Status da Nota": "Quitada"
            });
        });

        // Adiciona glosas individualmente
        glosasDaNota.forEach((glosa) => {
            rows.push({
                "NF Nº": nota.numero_nf,
                "Paciente": nota.paciente,
                "Serviço": nota.servico,
                "Data Real NF": formatarData(nota.data_real),
                "Data Registro": formatarData(nota.data_emissao),
                "Valor Total": nota.valor,
                "Recebimento Nº": '',
                "Data Recebimento": '',
                "Valor Recebido": '',
                "Forma Pagamento": '',
                "Glosa Aplicada": glosa.valor_glosa,
                "Data Glosa": formatarData(glosa.data_glosa),
                "Status da Nota": "Quitada"
            });
        });

        // Define a ordem exata das colunas
        const headers = [
            "NF Nº",
            "Paciente",
            "Serviço",
            "Data Real NF",
            "Data Registro",
            "Valor Total",
            "Recebimento Nº",
            "Data Recebimento",
            "Valor Recebido",
            "Forma Pagamento",
            "Glosa Aplicada",
            "Data Glosa",
            "Status da Nota"
        ];

        // Gera a planilha
        const worksheet = XLSX.utils.json_to_sheet([], { header: headers });
        XLSX.utils.sheet_add_json(worksheet, rows, { skipHeader: true, origin: "A2" });

        // Insere cabeçalho manualmente (com a ordem desejada)
        headers.forEach((col, idx) => {
            const cellRef = XLSX.utils.encode_cell({ r: 0, c: idx });
            worksheet[cellRef] = { t: "s", v: col };
        });

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Nota Quitada');

        const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([buffer], { type: 'application/octet-stream' });

        saveAs(blob, `nota_quitada_${nota.numero_nf}.xlsx`);
    };



    return (
        <div className="total-notas-container">
            <h2>Notas Fiscais Quitadas</h2>

            {notasQuitadas.length === 0 ? (
                <p className="mensagem-vazia">Nenhuma nota quitada encontrada.</p>
            ) : (
                <table className="tabela-total-notas">
                    <thead>
                        <tr>
                            <th>Número NF</th>
                            <th>Data Real NF</th>
                            <th>Data Registro</th>
                            <th>Paciente</th>
                            <th>Serviço</th>
                            <th>Valor Total</th>
                            <th>Recebido</th>
                            <th>Glosa</th>
                            <th>Excel</th>
                        </tr>
                    </thead>

                    <tbody>
                        {notasQuitadas.map(nota => (
                            <tr key={nota.id}>
                                <td>{nota.numero_nf}</td>
                                <td>{nota.data_real?.split('-').reverse().join('/')}</td>
                                <td>{nota.data_emissao?.split('-').reverse().join('/')}</td>
                                <td>{nota.paciente}</td>
                                <td>{nota.servico}</td>
                                <td>R$ {nota.valor.toFixed(2)}</td>
                                <td>R$ {nota.valor_recebido.toFixed(2)}</td>
                                <td>R$ {nota.valor_glosa.toFixed(2)}</td>
                                <td style={{ textAlign: 'center' }}>
                                    <button
                                        title="Exportar Nota Completa"
                                        onClick={() => exportarNotaCompleta(nota)}
                                        className="btn-excel"
                                    >
                                        <FaFileExcel size={18} color="#2e7d32" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>

                </table>
            )}
        </div>
    );
};

export default TotalNotas;
