import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import BottomNavigation from "@/components/BottomNavigation";
import ProgressChart from "@/components/ProgressChart";
import type { Milestone, MoodEntry } from "@shared/schema";

export default function Progress() {
  const { user } = useAuth();

  const { data: milestones = [] } = useQuery<Milestone[]>({
    queryKey: ["/api/milestones"],
    enabled: !!user,
  });

  const { data: moodHistory = [] } = useQuery<MoodEntry[]>({
    queryKey: ["/api/mood/history"],
    enabled: !!user,
  });

  const calculateRecoveryDays = () => {
    if (!user || !(user as any)?.recoveryStartDate) return 0;
    const startDate = new Date((user as any).recoveryStartDate);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - startDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const recoveryDays = calculateRecoveryDays();

  return (
    <div className="min-h-screen bg-bg-soft">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-md mx-auto px-4 py-3">
          <h1 className="text-lg font-semibold text-primary font-kanit text-center">
            ความก้าวหน้าของคุณ
          </h1>
        </div>
      </header>

      <main className="max-w-md mx-auto pb-20 p-4">
        {/* Recovery Stats */}
        <Card className="mb-6 shadow-sm">
          <CardContent className="p-6 text-center">
            <div className="mb-4">
              <div className="text-4xl font-bold text-primary mb-2 font-kanit">{recoveryDays}</div>
              <p className="text-gray-600 font-sarabun">วันของการฟื้นฟู</p>
            </div>
            
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-lg font-semibold text-secondary font-kanit">
                  {milestones.filter(m => m.achieved).length}
                </div>
                <p className="text-xs text-gray-600 font-sarabun">เป้าหมายสำเร็จ</p>
              </div>
              <div>
                <div className="text-lg font-semibold text-accent font-kanit">
                  {moodHistory.filter(m => m.mood === 'great').length}
                </div>
                <p className="text-xs text-gray-600 font-sarabun">วันที่ดี</p>
              </div>
              <div>
                <div className="text-lg font-semibold text-primary font-kanit">
                  {Math.floor(recoveryDays / 7)}
                </div>
                <p className="text-xs text-gray-600 font-sarabun">สัปดาห์</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Mood Chart */}
        <Card className="mb-6 shadow-sm">
          <CardContent className="p-4">
            <h3 className="text-lg font-semibold mb-4 font-kanit">
              แนวโน้มอารมณ์
            </h3>
            <ProgressChart />
          </CardContent>
        </Card>

        {/* Milestones */}
        <Card className="mb-6 shadow-sm">
          <CardContent className="p-4">
            <h3 className="text-lg font-semibold mb-4 font-kanit">
              เป้าหมายและความสำเร็จ
            </h3>
            
            <div className="space-y-4">
              {milestones.map((milestone) => {
                const progress = Math.min((recoveryDays / milestone.targetDays) * 100, 100);
                
                return (
                  <div key={milestone.id} className="border border-gray-200 rounded-card p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium font-kanit">{milestone.title}</h4>
                      <span className={`text-sm px-2 py-1 rounded-full ${
                        milestone.achieved 
                          ? 'bg-secondary/20 text-secondary' 
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {milestone.achieved ? 'สำเร็จแล้ว' : `${Math.round(progress)}%`}
                      </span>
                    </div>
                    
                    {milestone.description && (
                      <p className="text-sm text-gray-600 mb-3 font-sarabun">
                        {milestone.description}
                      </p>
                    )}
                    
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-500 ${
                          milestone.achieved ? 'bg-secondary' : 'bg-primary'
                        }`}
                        style={{ width: `${Math.min(progress, 100)}%` }}
                      ></div>
                    </div>
                    
                    <div className="flex justify-between text-xs text-gray-500 font-sarabun">
                      <span>เป้าหมาย: {milestone.targetDays} วัน</span>
                      {milestone.achieved && milestone.achievedAt && (
                        <span>สำเร็จเมื่อ: {new Date(milestone.achievedAt).toLocaleDateString('th-TH')}</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <h3 className="text-lg font-semibold mb-4 font-kanit">
              กิจกรรมล่าสุด
            </h3>
            
            <div className="space-y-3">
              {moodHistory.slice(0, 7).map((mood, index) => (
                <div key={mood.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-card">
                  <div className="flex items-center space-x-3">
                    <span className="text-lg">
                      {mood.mood === 'great' ? '😊' : 
                       mood.mood === 'okay' ? '😐' : 
                       mood.mood === 'struggling' ? '😔' : '😰'}
                    </span>
                    <div>
                      <p className="text-sm font-medium font-kanit">
                        {mood.mood === 'great' ? 'วันที่ดี' : 
                         mood.mood === 'okay' ? 'วันปกติ' : 
                         mood.mood === 'struggling' ? 'วันที่ท้าทาย' : 'วันที่ยากลำบาก'}
                      </p>
                      <p className="text-xs text-gray-600 font-sarabun">
                        {new Date(mood.date).toLocaleDateString('th-TH')}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>

      <BottomNavigation currentTab="progress" />
    </div>
  );
}
