import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import type { MoodEntry } from "@shared/schema";

export default function ProgressChart() {
  const { user } = useAuth();

  const { data: moodHistory = [] } = useQuery<MoodEntry[]>({
    queryKey: ["/api/mood/history"],
    enabled: !!user,
  });

  // Get last 7 days of mood data
  const getLast7Days = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      days.push(date.toISOString().split('T')[0]);
    }
    return days;
  };

  const last7Days = getLast7Days();
  const weekDays = ['จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส', 'อา'];

  const getMoodForDate = (date: string) => {
    const entry = moodHistory.find(m => m.date === date);
    return entry?.mood || null;
  };

  const getMoodHeight = (mood: string | null) => {
    switch (mood) {
      case 'great': return 'h-16';
      case 'okay': return 'h-10';
      case 'struggling': return 'h-6';
      case 'crisis': return 'h-4';
      default: return 'h-2';
    }
  };

  const getMoodColor = (mood: string | null) => {
    switch (mood) {
      case 'great': return 'bg-secondary';
      case 'okay': return 'bg-accent';
      case 'struggling': return 'bg-orange-400';
      case 'crisis': return 'bg-red-400';
      default: return 'bg-gray-200';
    }
  };

  return (
    <div className="bg-support/30 rounded-card p-4">
      <p className="text-sm font-medium mb-2 font-kanit">ความรู้สึกในสัปดาห์นี้</p>
      
      <div className="flex items-end space-x-2 h-20 mb-2">
        {last7Days.map((date, index) => {
          const mood = getMoodForDate(date);
          return (
            <div key={date} className="flex-1 flex flex-col items-center">
              <div 
                className={`w-full rounded-t transition-all duration-300 ${getMoodHeight(mood)} ${getMoodColor(mood)}`}
                title={mood ? `${weekDays[index]}: ${mood}` : `${weekDays[index]}: ไม่มีข้อมูล`}
              ></div>
            </div>
          );
        })}
      </div>
      
      <div className="flex justify-between text-xs text-gray-500 font-sarabun">
        {weekDays.map((day) => (
          <span key={day}>{day}</span>
        ))}
      </div>
      
      {/* Legend */}
      <div className="mt-3 flex items-center justify-center space-x-4 text-xs">
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 bg-secondary rounded"></div>
          <span className="text-gray-600 font-sarabun">ดี</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 bg-accent rounded"></div>
          <span className="text-gray-600 font-sarabun">ปกติ</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 bg-orange-400 rounded"></div>
          <span className="text-gray-600 font-sarabun">ยาก</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 bg-red-400 rounded"></div>
          <span className="text-gray-600 font-sarabun">วิกฤต</span>
        </div>
      </div>
    </div>
  );
}
