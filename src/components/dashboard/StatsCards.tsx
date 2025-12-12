'use client';

import React from 'react';

interface StatsCardsProps {
  stats: {
    activeProjects: number;
    completedTasks: number;
    totalHours: string;
    totalProjects: number;
  };
}

export const StatsCards: React.FC<StatsCardsProps> = ({ stats }) => {
  const cards = [
    {
      title: 'Active Projects',
      value: stats.activeProjects,
      icon: (
        <svg className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14-7l-7 7-7-7m14 18l-7-7-7 7" />
        </svg>
      ),
      bgColor: 'bg-blue-100 dark:bg-blue-900/30',
    },
    {
      title: 'Completed Tasks',
      value: stats.completedTasks,
      icon: (
        <svg className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      bgColor: 'bg-green-100 dark:bg-green-900/30',
    },
    {
      title: 'Hours Logged',
      value: stats.totalHours,
      icon: (
        <svg className="h-6 w-6 text-orange-600 dark:text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      bgColor: 'bg-orange-100 dark:bg-orange-900/30',
    },
    {
      title: 'Total Projects',
      value: stats.totalProjects,
      icon: (
        <svg className="h-6 w-6 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14-7l-7 7-7-7m14 18l-7-7-7 7" />
        </svg>
      ),
      bgColor: 'bg-purple-100 dark:bg-purple-900/30',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {cards.map((card, index) => (
        <div
          key={index}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center">
            <div className={`p-3 rounded-xl ${card.bgColor}`}>
              {card.icon}
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{card.title}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{card.value}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
