import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './LossChart.css';

interface LossChartProps {
  data: Array<{
    epoch: number;
    genLoss: number;
    discLoss: number;
  }>;
}

function LossChart({ data }: LossChartProps) {
  if (data.length === 0) {
    return (
      <div className="loss-chart-empty">
        <p>Training data will appear here...</p>
      </div>
    );
  }

  return (
    <div className="loss-chart-container">
      <h3>📈 Loss Over Epochs</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
          <XAxis 
            dataKey="epoch" 
            label={{ value: 'Epoch', position: 'insideBottom', offset: -5 }}
            stroke="#666"
          />
          <YAxis 
            label={{ value: 'Loss', angle: -90, position: 'insideLeft' }}
            stroke="#666"
          />
          <Tooltip 
            contentStyle={{ 
              background: 'rgba(255, 255, 255, 0.95)', 
              border: '1px solid #ccc',
              borderRadius: '8px',
              padding: '10px'
            }}
          />
          <Legend 
            wrapperStyle={{ paddingTop: '20px' }}
          />
          <Line 
            type="monotone" 
            dataKey="genLoss" 
            stroke="#667eea" 
            strokeWidth={2}
            name="Generator Loss"
            dot={{ fill: '#667eea', r: 3 }}
            activeDot={{ r: 5 }}
          />
          <Line 
            type="monotone" 
            dataKey="discLoss" 
            stroke="#f093fb" 
            strokeWidth={2}
            name="Discriminator Loss"
            dot={{ fill: '#f093fb', r: 3 }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default LossChart;
