import React, { useEffect, useState } from 'react';
import './Dashboard.css';
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  ArcElement,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';

ChartJS.register(
  BarElement,
  CategoryScale,
  LinearScale,
  ArcElement,
  PointElement,
  LineElement,
  Tooltip,
  Legend
);

const Dashboard = () => {
  const [notas, setNotas] = useState([]);
  const [despesas, setDespesas] = useState([]);

  useEffect(() => {
    fetch('http://localhost:8000/notas-emitidas')
      .then((res) => res.json())
      .then(setNotas);

    fetch('http://localhost:8000/despesas')
      .then((res) => res.json())
      .then(setDespesas);
  }, []);

  // ==== Faturamento mensal (por mês de emissão) ====
  const meses = [
    'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
    'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
  ];

  const faturamentoPorMes = new Array(12).fill(0);
  const glosasPorMes = new Array(12).fill(0);
  let totalRecebido = 0;
  let totalPendente = 0;

  notas.forEach((nota: any) => {
    const mes = new Date(nota.data_emissao).getMonth();
    faturamentoPorMes[mes] += nota.valor;
    glosasPorMes[mes] += nota.valor_glosa || 0;
    totalRecebido += nota.valor_recebido || 0;
    totalPendente += nota.valor_pendente || 0;
  });

  const despesasFixas = despesas.filter((d: any) =>
    ['Aluguel', 'Salário', 'Manutenção'].includes(d.categoria)
  );
  const despesasVariaveis = despesas.filter((d: any) =>
    !['Aluguel', 'Salário', 'Manutenção'].includes(d.categoria)
  );

  return (
    <div className="dashboard-container">
      <h2>Dashboard Financeiro</h2>

      <div className="charts-grid">
        <div className="chart-box">
          <h4>Faturamento Mensal</h4>
          <Bar
            data={{
              labels: meses,
              datasets: [{
                label: 'Valor R$',
                data: faturamentoPorMes,
                backgroundColor: '#4caf50'
              }]
            }}
            options={{ responsive: true }}
          />
        </div>

        <div className="chart-box">
          <h4>Glosas por Mês</h4>
          <Line
            data={{
              labels: meses,
              datasets: [{
                label: 'Glosas R$',
                data: glosasPorMes,
                borderColor: '#f44336',
                backgroundColor: '#ffcdd2'
              }]
            }}
            options={{ responsive: true }}
          />
        </div>

        <div className="chart-box">
          <h4>Recebido vs Pendente</h4>
          <Pie
            data={{
              labels: ['Recebido', 'Pendente'],
              datasets: [{
                data: [totalRecebido, totalPendente],
                backgroundColor: ['#2196f3', '#ff9800']
              }]
            }}
            options={{ responsive: true }}
          />
        </div>

        <div className="chart-box">
          <h4>Despesas Fixas vs Variáveis</h4>
          <Bar
            data={{
              labels: ['Fixas', 'Variáveis'],
              datasets: [{
                label: 'Valor R$',
                data: [
                  despesasFixas.reduce((a, b) => a + b.valor, 0),
                  despesasVariaveis.reduce((a, b) => a + b.valor, 0)
                ],
                backgroundColor: ['#9c27b0', '#03a9f4']
              }]
            }}
            options={{ responsive: true }}
          />
        </div>
      </div>
      <footer className="dashboard-footer">
        &copy; {new Date().getFullYear()} Moacir Fernandes - All Rights Reserved
      </footer>

    </div>
  );
};

export default Dashboard;
