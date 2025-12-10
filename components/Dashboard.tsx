import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';

const moodData = [
  { day: 'Mon', score: 65 },
  { day: 'Tue', score: 58 },
  { day: 'Wed', score: 72 },
  { day: 'Thu', score: 80 },
  { day: 'Fri', score: 85 },
  { day: 'Sat', score: 90 },
  { day: 'Sun', score: 88 },
];

const stressData = [
  { name: 'Academic', value: 70 },
  { name: 'Social', value: 40 },
  { name: 'Health', value: 30 },
  { name: 'Sleep', value: 85 },
];

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042'];

export const Dashboard: React.FC = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      <header className="mb-8">
        <h2 className="text-3xl font-bold text-slate-800">Hello, Student</h2>
        <p className="text-slate-500">Your mental wellness overview for the week.</p>
      </header>

      {/* Top Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-slate-500">Wellness Score</p>
                <p className="text-3xl font-bold text-teal-600">82<span className="text-sm text-teal-400 ml-1">/100</span></p>
            </div>
            <div className="bg-teal-50 p-3 rounded-full text-teal-600">
                <i className="fas fa-heart-pulse text-xl"></i>
            </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-slate-500">Burnout Risk</p>
                <p className="text-3xl font-bold text-orange-500">Low</p>
            </div>
            <div className="bg-orange-50 p-3 rounded-full text-orange-600">
                <i className="fas fa-battery-three-quarters text-xl"></i>
            </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-slate-500">Study Streak</p>
                <p className="text-3xl font-bold text-indigo-600">5 Days</p>
            </div>
            <div className="bg-indigo-50 p-3 rounded-full text-indigo-600">
                <i className="fas fa-fire text-xl"></i>
            </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Mood Trend */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Mood Trend</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={moodData}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#82ca9d" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                <Area type="monotone" dataKey="score" stroke="#82ca9d" fillOpacity={1} fill="url(#colorScore)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Stress Factors */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Current Stress Factors</h3>
          <div className="h-64">
             <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stressData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                    <YAxis />
                    <Tooltip cursor={{fill: 'transparent'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}/>
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                        {stressData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Bar>
                </BarChart>
             </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      <div className="bg-indigo-600 rounded-2xl p-6 text-white flex flex-col md:flex-row items-center justify-between">
          <div className="mb-4 md:mb-0">
              <h3 className="text-xl font-bold mb-2">Need immediate help?</h3>
              <p className="text-indigo-100">Talk to MindMate Voice or start a chat session now.</p>
          </div>
          <button className="bg-white text-indigo-600 px-6 py-2 rounded-full font-bold shadow-md hover:bg-indigo-50 transition">
              Start Session
          </button>
      </div>
    </div>
  );
};
