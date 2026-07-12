import { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import type { ContributionData } from '../../services/githubService';

interface ContributionHeatmapProps {
  data: ContributionData | null;
}

export const ContributionHeatmap = ({ data }: ContributionHeatmapProps) => {
  const chartData = useMemo(() => {
    if (!data || !data.contributions) return [];
    return data.contributions.map((item) => [item.date, item.count]);
  }, [data]);

  if (!data || !data.contributions) {
    return <div className="loading-graph">Loading Contribution Graph...</div>;
  }

  const totalContributions = data.contributions.reduce((acc, curr) => acc + curr.count, 0);
  const startDate = data.contributions[0]?.date;
  const endDate = data.contributions[data.contributions.length - 1]?.date;

  const option = {
    tooltip: {
      position: 'top',
      formatter: (p: { data: [string, number] }) => {
        const [date, value] = p.data;
        return `${value} contributions on ${date}`;
      },
    },
    visualMap: {
      min: 0,
      max: 20,
      type: 'piecewise',
      orient: 'horizontal',
      left: 'right',
      bottom: 0,
      text: ['More', 'Less'],
      colors: ['#216e39', '#30a14e', '#40c463', '#9be9a8', '#ebedf0'],
      pieces: [
        { min: 15, color: '#216e39' },
        { min: 10, max: 14, color: '#30a14e' },
        { min: 5, max: 9, color: '#40c463' },
        { min: 1, max: 4, color: '#9be9a8' },
        { value: 0, color: '#ebedf0' },
      ],
      show: true,
      itemWidth: 10,
      itemHeight: 10,
    },
    calendar: {
      top: 30,
      left: 30,
      right: 30,
      cellSize: ['auto', 13],
      range: [startDate, endDate],
      itemStyle: {
        borderWidth: 2,
        borderColor: '#fff',
      },
      splitLine: { show: false },
      yearLabel: { show: false },
      dayLabel: {
        firstDay: 1,
        nameMap: ['Sun', 'Mon', '', 'Wed', '', 'Fri', ''],
        color: '#656d76',
        fontSize: 10,
      },
      monthLabel: {
        color: '#656d76',
        fontSize: 10,
      },
    },
    series: {
      type: 'heatmap',
      coordinateSystem: 'calendar',
      data: chartData,
    },
  };

  return (
    <div
      className="contributions-section"
      data-platform-id="platform-contrib"
      data-platform-action="info"
      data-platform-label="View contribution graph"
      data-platform-info={`${totalContributions.toLocaleString()} contributions in the last year.`}
    >
      <div className="contribution-header">
        <h2>{totalContributions.toLocaleString()} contributions in the last year</h2>
        <div className="settings">Contribution settings ▾</div>
      </div>

      <div className="graph-container">
        <ReactECharts option={option} style={{ height: '180px', width: '100%' }} opts={{ renderer: 'svg' }} />
      </div>
    </div>
  );
};
