import React from 'react';

const legend = [
  { 
    icon: '✓', 
    label: 'Asistió', 
    color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    iconBg: 'bg-emerald-500 text-white'
  },
  { 
    icon: '✗', 
    label: 'No asistió', 
    color: 'bg-red-50 text-red-700 border-red-200',
    iconBg: 'bg-red-500 text-white'
  },
  { 
    icon: '⏱', 
    label: 'Por asistir', 
    color: 'bg-amber-50 text-amber-700 border-amber-200',
    iconBg: 'bg-amber-500 text-white'
  },
];

const AttendanceLegend = () => (
  <div className="flex items-center space-x-3">
    <span className="text-sm font-medium text-gray-600 hidden sm:block">Estado:</span>
    <div className="flex space-x-2">
      {legend.map((item) => (
        <div key={item.label} className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg border font-medium text-xs transition-colors hover:scale-105 ${item.color}`}>
          <div className={`w-5 h-5 rounded-full ${item.iconBg} flex items-center justify-center text-xs font-bold`}>
            {item.icon}
          </div>
          <span className="hidden sm:inline">{item.label}</span>
        </div>
      ))}
    </div>
  </div>
);

export default AttendanceLegend;
