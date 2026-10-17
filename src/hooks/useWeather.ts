import { useEngineerStore } from '../store/engineerStore';

export const useWeather = () => {
  const { weather, setWeather } = useEngineerStore();

  const getRiskLevel = (w: any) => {
    if (!w) return 'Low';
    if (w.precipitation > 70) return 'High';
    if (w.precipitation > 40) return 'Medium';
    return 'Low';
  };

  const getRecommendation = (w: any) => {
    if (!w) return 'No weather data available.';
    if (w.precipitation > 70) return '?? High rain risk. Consider rescheduling outdoor work.';
    if (w.precipitation > 40) return '?? Rain possible. Have contingency plan ready.';
    if (w.condition === 'Storm') return '?? Storm warning. Site safety is a priority.';
    return '? Weather conditions favorable for site work.';
  };

  return {
    weather,
    getRiskLevel,
    getRecommendation,
    setWeather,
  };
};
