export const getLevel = (points: number) => {
  if (points < 10) return { name: 'Đang tiến bộ', color: 'text-gray-500', bg: 'bg-gray-100', border: 'border-gray-200' };
  if (points < 20) return { name: 'Chăm ngoan', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' };
  if (points < 30) return { name: 'Tích cực', color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' };
  if (points < 50) return { name: 'Xuất sắc', color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200' };
  return { name: 'Ngôi sao', color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200' };
};
