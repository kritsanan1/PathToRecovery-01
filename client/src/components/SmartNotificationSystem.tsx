import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { MoodEntry, Milestone } from "@shared/schema";

interface SmartNotification {
  id: string;
  type: 'mood_reminder' | 'milestone_celebration' | 'streak_alert' | 'support_suggestion' | 'crisis_detection';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  actionText?: string;
  actionUrl?: string;
  dismissed?: boolean;
  createdAt: Date;
}

export default function SmartNotificationSystem() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<SmartNotification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  const { data: todayMood } = useQuery({
    queryKey: ["/api/mood/today"],
    enabled: !!user,
  });

  const { data: moodHistory = [] } = useQuery<MoodEntry[]>({
    queryKey: ["/api/mood/history"],
    enabled: !!user,
  });

  const { data: milestones = [] } = useQuery<Milestone[]>({
    queryKey: ["/api/milestones"],
    enabled: !!user,
  });

  useEffect(() => {
    if (!user) return;

    const generateSmartNotifications = (): SmartNotification[] => {
      const newNotifications: SmartNotification[] = [];
      const now = new Date();
      const currentHour = now.getHours();

      // Check if mood hasn't been logged today
      if (!todayMood && currentHour >= 8) {
        newNotifications.push({
          id: 'mood_reminder_' + now.getTime(),
          type: 'mood_reminder',
          title: 'อย่าลืมบันทึกอารมณ์วันนี้',
          message: 'การติดตามอารมณ์ประจำวันช่วยให้คุณเข้าใจตัวเองมากขึ้น',
          priority: 'medium',
          actionText: 'บันทึกอารมณ์',
          actionUrl: '/',
          createdAt: now,
        });
      }

      // Check for recent struggles and suggest support
      const recentMoods = moodHistory.slice(-3);
      const strugglingCount = recentMoods.filter(m => ['struggling', 'crisis'].includes(m.mood)).length;
      
      if (strugglingCount >= 2) {
        newNotifications.push({
          id: 'support_suggestion_' + now.getTime(),
          type: 'support_suggestion',
          title: 'คุณไม่ได้อยู่คนเดียว',
          message: 'ช่วงนี้อาจเป็นช่วงที่ท้าทาย ลองหาความช่วยเหลือจากชุมชนหรือผู้เชี่ยวชาญ',
          priority: 'high',
          actionText: 'ขอความช่วยเหลือ',
          actionUrl: '/crisis',
          createdAt: now,
        });
      }

      // Check for achieved milestones
      const achievedMilestones = milestones.filter(m => m.achieved && m.achievedAt);
      const recentAchievements = achievedMilestones.filter(m => {
        const achievedDate = new Date(m.achievedAt!);
        const daysDiff = (now.getTime() - achievedDate.getTime()) / (1000 * 3600 * 24);
        return daysDiff <= 1; // Within last 24 hours
      });

      recentAchievements.forEach(milestone => {
        newNotifications.push({
          id: 'milestone_celebration_' + milestone.id,
          type: 'milestone_celebration',
          title: 'ยินดีด้วย! คุณบรรลุเป้าหมายแล้ว',
          message: `คุณสำเร็จ "${milestone.title}" แล้ว! นี่คือความก้าวหน้าที่ยอดเยี่ยม`,
          priority: 'high',
          actionText: 'ดูความก้าวหน้า',
          actionUrl: '/progress',
          createdAt: now,
        });
      });

      // Check for good mood streaks
      const calculateCurrentStreak = () => {
        let streak = 0;
        const sortedMoods = [...moodHistory].sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        
        for (const mood of sortedMoods) {
          if (['great', 'okay'].includes(mood.mood)) {
            streak++;
          } else {
            break;
          }
        }
        return streak;
      };

      const currentStreak = calculateCurrentStreak();
      if (currentStreak === 7) {
        newNotifications.push({
          id: 'streak_alert_7',
          type: 'streak_alert',
          title: 'สุดยอด! คุณมีวันที่ดี 7 วันติดต่อกัน',
          message: 'ความต่อเนื่องของคุณน่าชื่นชม ทำต่อไปเช่นนี้!',
          priority: 'high',
          actionText: 'ดูสถิติ',
          actionUrl: '/analytics',
          createdAt: now,
        });
      }

      // Crisis detection based on multiple indicators
      const recentCrisisMoods = recentMoods.filter(m => m.mood === 'crisis').length;
      if (recentCrisisMoods >= 2) {
        newNotifications.push({
          id: 'crisis_detection_' + now.getTime(),
          type: 'crisis_detection',
          title: 'เราห่วงใยคุณ',
          message: 'ถ้าคุณรู้สึกไม่ปลอดภัย กรุณาติดต่อสายด่วน 1413 ทันที',
          priority: 'critical',
          actionText: 'โทรขอความช่วยเหลือ',
          actionUrl: '/crisis',
          createdAt: now,
        });
      }

      return newNotifications;
    };

    const newNotifications = generateSmartNotifications();
    setNotifications(prev => {
      const filtered = prev.filter(n => !n.dismissed);
      const existing = filtered.map(n => n.id);
      const toAdd = newNotifications.filter(n => !existing.includes(n.id));
      return [...filtered, ...toAdd];
    });
  }, [user, todayMood, moodHistory, milestones]);

  const dismissNotification = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, dismissed: true } : n)
    );
  };

  const activeNotifications = notifications.filter(n => !n.dismissed);
  const criticalNotifications = activeNotifications.filter(n => n.priority === 'critical');
  const highPriorityNotifications = activeNotifications.filter(n => n.priority === 'high');

  if (activeNotifications.length === 0) return null;

  return (
    <div className="relative">
      {/* Notification Bell */}
      <button
        onClick={() => setShowNotifications(!showNotifications)}
        className="relative p-2 text-gray-500 hover:text-primary transition-colors"
      >
        <i className="fas fa-bell text-lg"></i>
        {activeNotifications.length > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            {activeNotifications.length}
          </span>
        )}
      </button>

      {/* Critical Notifications (Always Visible) */}
      {criticalNotifications.map(notification => (
        <div key={notification.id} className="fixed top-16 left-4 right-4 z-50 max-w-md mx-auto">
          <Alert className="border-l-4 border-l-red-500 bg-red-50 border-red-200">
            <AlertDescription className="flex items-start justify-between">
              <div className="flex-1">
                <p className="font-medium text-red-800 font-kanit">{notification.title}</p>
                <p className="text-sm text-red-700 mt-1 font-sarabun">{notification.message}</p>
                {notification.actionText && notification.actionUrl && (
                  <Button
                    size="sm"
                    className="mt-2 bg-red-600 text-white hover:bg-red-700"
                    onClick={() => window.location.href = notification.actionUrl!}
                  >
                    {notification.actionText}
                  </Button>
                )}
              </div>
              <button
                onClick={() => dismissNotification(notification.id)}
                className="ml-3 text-red-400 hover:text-red-600"
              >
                <i className="fas fa-times"></i>
              </button>
            </AlertDescription>
          </Alert>
        </div>
      ))}

      {/* Notification Panel */}
      {showNotifications && (
        <div className="absolute top-12 right-0 w-80 max-w-[calc(100vw-2rem)] bg-white border border-gray-200 rounded-lg shadow-lg z-40 max-h-96 overflow-y-auto">
          <div className="p-3 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h3 className="font-medium font-kanit">การแจ้งเตือน</h3>
              <Badge variant="secondary" className="text-xs">
                {activeNotifications.length}
              </Badge>
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {activeNotifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <i className="fas fa-bell-slash text-2xl mb-2 text-gray-300"></i>
                <p className="text-sm font-sarabun">ไม่มีการแจ้งเตือน</p>
              </div>
            ) : (
              <div className="space-y-1">
                {activeNotifications.map(notification => (
                  <div key={notification.id} className="p-3 border-b border-gray-50 last:border-b-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <Badge 
                            variant={notification.priority === 'critical' ? 'destructive' : 
                                   notification.priority === 'high' ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {notification.priority === 'critical' ? 'ด่วนมาก' : 
                             notification.priority === 'high' ? 'สำคัญ' : 
                             notification.priority === 'medium' ? 'ปานกลาง' : 'ทั่วไป'}
                          </Badge>
                        </div>
                        <p className="font-medium text-sm font-kanit">{notification.title}</p>
                        <p className="text-xs text-gray-600 mt-1 font-sarabun">{notification.message}</p>
                        {notification.actionText && notification.actionUrl && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="mt-2 h-7 text-xs"
                            onClick={() => {
                              window.location.href = notification.actionUrl!;
                              setShowNotifications(false);
                            }}
                          >
                            {notification.actionText}
                          </Button>
                        )}
                      </div>
                      <button
                        onClick={() => dismissNotification(notification.id)}
                        className="ml-2 text-gray-400 hover:text-gray-600"
                      >
                        <i className="fas fa-times text-xs"></i>
                      </button>
                    </div>
                    <p className="text-xs text-gray-400 mt-2 font-sarabun">
                      {notification.createdAt.toLocaleTimeString('th-TH', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-3 border-t border-gray-100">
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-xs"
              onClick={() => {
                setNotifications(prev => prev.map(n => ({ ...n, dismissed: true })));
                setShowNotifications(false);
              }}
            >
              ล้างการแจ้งเตือนทั้งหมด
            </Button>
          </div>
        </div>
      )}

      {/* Click outside to close */}
      {showNotifications && (
        <div 
          className="fixed inset-0 z-30"
          onClick={() => setShowNotifications(false)}
        />
      )}
    </div>
  );
}