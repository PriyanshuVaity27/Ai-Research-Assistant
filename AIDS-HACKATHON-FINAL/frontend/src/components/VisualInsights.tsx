
import React from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line, CartesianGrid
} from 'recharts';
import { ChartContainer } from '@/components/ui/chart-container';
import { GlassmorphicCard } from '@/components/ui/glassmorphic-card';
import { NeonText } from '@/components/ui/neon-text';

// Sample data
const frequencyData = [
  { name: 'Machine Learning', value: 85 },
  { name: 'Neural Networks', value: 72 },
  { name: 'Deep Learning', value: 63 },
  { name: 'NLP', value: 57 },
  { name: 'Computer Vision', value: 49 },
  { name: 'Reinforcement Learning', value: 42 },
];

const citationsData = [
  { name: 'Paper A', value: 324 },
  { name: 'Paper B', value: 287 },
  { name: 'Paper C', value: 185 },
  { name: 'Paper D', value: 142 },
  { name: 'Paper E', value: 98 },
];

const trendsData = [
  { month: 'Jan', publications: 20 },
  { month: 'Feb', publications: 15 },
  { month: 'Mar', publications: 32 },
  { month: 'Apr', publications: 28 },
  { month: 'May', publications: 45 },
  { month: 'Jun', publications: 42 },
];

const COLORS = ['#00FFFF', '#9900FF', '#FF00FF', '#00FF99', '#9966FF', '#00CCFF'];

const chartConfig = {
  frequency: {
    label: "Frequency Analysis",
  },
  citations: {
    label: "Citation Impact",
  },
  trends: {
    label: "Publication Trends",
  }
};

const VisualInsights = () => {
  return (
    <section id="insights" className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <NeonText as="h2" color="multi" size="3xl" className="font-bold mb-4">
              Visual Insights
            </NeonText>
            <p className="text-light-gray/80 max-w-2xl mx-auto">
              Interactive visualizations of your research data
            </p>
          </motion.div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="h-full"
          >
            <GlassmorphicCard className="h-full" glowColor="rgba(0, 255, 255, 0.2)">
              <NeonText as="h3" color="blue" size="xl" className="mb-4 font-medium">
                Keyword Frequency
              </NeonText>
              <ChartContainer config={chartConfig}>
                <BarChart data={frequencyData} layout="vertical">
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" width={100} axisLine={false} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.8)', borderColor: 'rgba(255, 255, 255, 0.1)', borderRadius: '8px' }}
                  />
                  <Bar 
                    dataKey="value" 
                    fill="url(#barGradient)" 
                    radius={[0, 4, 4, 0]}
                  />
                  <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#00FFFF" />
                      <stop offset="100%" stopColor="#9900FF" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ChartContainer>
            </GlassmorphicCard>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="h-full"
          >
            <GlassmorphicCard className="h-full" glowColor="rgba(153, 0, 255, 0.2)">
              <NeonText as="h3" color="purple" size="xl" className="mb-4 font-medium">
                Citation Impact
              </NeonText>
              <ChartContainer config={chartConfig}>
                <PieChart>
                  <Pie
                    data={citationsData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {citationsData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.8)', borderColor: 'rgba(255, 255, 255, 0.1)', borderRadius: '8px' }}
                  />
                </PieChart>
              </ChartContainer>
            </GlassmorphicCard>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="h-full"
          >
            <GlassmorphicCard className="h-full" glowColor="rgba(0, 204, 255, 0.2)">
              <NeonText as="h3" color="cyan" size="xl" className="mb-4 font-medium">
                Publication Trends
              </NeonText>
              <ChartContainer config={chartConfig}>
                <LineChart data={trendsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="month" stroke="rgba(255,255,255,0.5)" />
                  <YAxis stroke="rgba(255,255,255,0.5)" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.8)', borderColor: 'rgba(255, 255, 255, 0.1)', borderRadius: '8px' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="publications" 
                    stroke="url(#lineGradient)" 
                    strokeWidth={3} 
                    activeDot={{ r: 8, fill: '#00FFFF', stroke: '#000' }}
                  />
                  <defs>
                    <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#00CCFF" />
                      <stop offset="100%" stopColor="#00FF99" />
                    </linearGradient>
                  </defs>
                </LineChart>
              </ChartContainer>
            </GlassmorphicCard>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default VisualInsights;
