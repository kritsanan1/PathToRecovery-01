import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import BottomNavigation from "@/components/BottomNavigation";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { MoodEntry, Milestone } from "@shared/schema";

export default function Analytics() {
  const { user } = useAuth();

  const { data: moodHistory = [] } = useQuery<MoodEntry[]>({
    queryKey: ["/api/mood/history"],
    enabled: !!user,
  });

  const { data: milestones = [] } = useQuery<Milestone[]>({
    queryKey: ["/api/milestones"],
    enabled: !!user,
  });

  // Advanced analytics calculations
  const calculateStreaks = () => {
    const goodDays = moodHistory.filter(m => ['great', 'okay'].includes(m.mood));
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;

    // Sort by date descending
    const sortedMoods = [...moodHistory].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    // Calculate current streak from today backwards
    for (const mood of sortedMoods) {
      if (['great', 'okay'].includes(mood.mood)) {
        currentStreak++;
      } else {
        break;
      }
    }

    // Calculate longest streak
    for (const mood of moodHistory) {
      if (['great', 'okay'].includes(mood.mood)) {
        tempStreak++;
        longestStreak = Math.max(longestStreak, tempStreak);
      } else {
        tempStreak = 0;
      }
    }

    return { currentStreak, longestStreak, totalGoodDays: goodDays.length };
  };

  const calculateMoodTrends = () => {
    const last7Days = moodHistory.slice(-7);
    const last14Days = moodHistory.slice(-14, -7);
    
    const scoreMap = { great: 4, okay: 3, struggling: 2, crisis: 1 };
    
    const recent7Avg = last7Days.length > 0 
      ? last7Days.reduce((acc, mood) => acc + scoreMap[mood.mood as keyof typeof scoreMap], 0) / last7Days.length
      : 0;
      
    const previous7Avg = last14Days.length > 0
      ? last14Days.reduce((acc, mood) => acc + scoreMap[mood.mood as keyof typeof scoreMap], 0) / last14Days.length
      : 0;

    const trend = recent7Avg - previous7Avg;
    return {
      trend: trend > 0.3 ? 'improving' : trend < -0.3 ? 'declining' : 'stable',
      trendValue: trend,
      recentScore: recent7Avg,
      weeklyImprovement: trend > 0
    };
  };

  const generateInsights = () => {
    const { currentStreak, longestStreak, totalGoodDays } = calculateStreaks();
    const { trend, weeklyImprovement } = calculateMoodTrends();
    const recoveryDays = calculateRecoveryDays();
    
    const insights = [];

    if (currentStreak >= 7) {
      insights.push({
        type: 'success',
        title: 'ยอดเยี่ยม! คุณมีวันที่ดีต่อเนื่อง',
        description: `คุณมีอารมณ์ที่ดีมาแล้ว ${currentStreak} วันติดต่อกัน`,
        icon: '🎉'
      });
    }

    if (weeklyImprovement) {
      insights.push({
        type: 'positive',
        title: 'อารมณ์ของคุณดีขึ้น',
        description: 'สัปดาห์นี้อารมณ์คุณดีขึ้นจากสัปดาห์ที่แล้ว',
        icon: '📈'
      });
    }

    if (recoveryDays >= 30 && totalGoodDays / recoveryDays > 0.8) {
      insights.push({
        type: 'achievement',
        title: 'นักสู้ตัวจริง',
        description: `คุณมีวันที่ดีมากกว่า 80% ของเวลาที่ฟื้นฟู`,
        icon: '🏆'
      });
    }

    if (currentStreak === 0 && trend !== 'declining') {
      insights.push({
        type: 'motivation',
        title: 'เริ่มต้นใหม่ได้เสมอ',
        description: 'วันใหม่เป็นโอกาสใหม่ในการดูแลตัวเอง',
        icon: '🌅'
      });
    }

    return insights;
  };

  const calculateRecoveryDays = () => {
    if (!user || !(user as any)?.recoveryStartDate) return 0;
    const startDate = new Date((user as any).recoveryStartDate);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - startDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getPredictiveScore = () => {
    const { recentScore } = calculateMoodTrends();
    const { currentStreak } = calculateStreaks();
    const completedMilestones = milestones.filter(m => m.achieved).length;
    
    // Weighted scoring algorithm
    const moodWeight = 0.4;
    const streakWeight = 0.3;
    const milestoneWeight = 0.3;
    
    const moodScore = (recentScore / 4) * 100;
    const streakScore = Math.min(currentStreak * 10, 100);
    const milestoneScore = Math.min(completedMilestones * 25, 100);
    
    return Math.round(
      (moodScore * moodWeight) + 
      (streakScore * streakWeight) + 
      (milestoneScore * milestoneWeight)
    );
  };

  const streaks = calculateStreaks();
  const trends = calculateMoodTrends();
  const insights = generateInsights();
  const predictiveScore = getPredictiveScore();
  const recoveryDays = calculateRecoveryDays();

  return (
    <div className="min-h-screen bg-bg-soft">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-md mx-auto px-4 py-3">
          <h1 className="text-lg font-semibold text-primary font-kanit text-center">
            วิเคราะห์ความก้าวหน้า
          </h1>
        </div>
      </header>

      <main className="max-w-md mx-auto pb-20 p-4">
        {/* Recovery Score */}
        <Card className="mb-6 shadow-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-lg font-kanit">คะแนนการฟื้นฟูของคุณ</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <div className="relative w-32 h-32 mx-auto mb-4">
              <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" stroke="var(--support)" strokeWidth="8" fill="none"/>
                <circle 
                  cx="50" cy="50" r="45" 
                  stroke="var(--secondary)" 
                  strokeWidth="8" 
                  fill="none" 
                  strokeDasharray="283" 
                  strokeDashoffset={283 - (283 * predictiveScore / 100)} 
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold text-secondary font-kanit">
                  {predictiveScore}
                </span>
              </div>
            </div>
            <p className="text-sm text-gray-600 font-sarabun">
              จากการวิเคราะห์อารมณ์ เป้าหมาย และความต่อเนื่อง
            </p>
          </CardContent>
        </Card>

        {/* Insights */}
        {insights.length > 0 && (
          <div className="mb-6 space-y-3">
            {insights.map((insight, index) => (
              <Alert key={index} className={`border-l-4 ${
                insight.type === 'success' ? 'border-l-secondary bg-secondary/5' :
                insight.type === 'positive' ? 'border-l-primary bg-primary/5' :
                insight.type === 'achievement' ? 'border-l-accent bg-accent/5' :
                'border-l-gray-400 bg-gray-50'
              }`}>
                <AlertDescription className="flex items-start space-x-3">
                  <span className="text-lg">{insight.icon}</span>
                  <div>
                    <p className="font-medium text-sm font-kanit">{insight.title}</p>
                    <p className="text-sm text-gray-600 font-sarabun">{insight.description}</p>
                  </div>
                </AlertDescription>
              </Alert>
            ))}
          </div>
        )}

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview" className="text-xs font-sarabun">ภาพรวม</TabsTrigger>
            <TabsTrigger value="trends" className="text-xs font-sarabun">แนวโน้ม</TabsTrigger>
            <TabsTrigger value="goals" className="text-xs font-sarabun">เป้าหมาย</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {/* Key Metrics */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="shadow-sm">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-primary font-kanit mb-1">
                    {streaks.currentStreak}
                  </div>
                  <p className="text-xs text-gray-600 font-sarabun">วันที่ดีต่อเนื่อง</p>
                </CardContent>
              </Card>
              
              <Card className="shadow-sm">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-secondary font-kanit mb-1">
                    {streaks.longestStreak}
                  </div>
                  <p className="text-xs text-gray-600 font-sarabun">สถิติดีที่สุด</p>
                </CardContent>
              </Card>
              
              <Card className="shadow-sm">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-accent font-kanit mb-1">
                    {Math.round((streaks.totalGoodDays / Math.max(recoveryDays, 1)) * 100)}%
                  </div>
                  <p className="text-xs text-gray-600 font-sarabun">วันที่มีความสุข</p>
                </CardContent>
              </Card>
              
              <Card className="shadow-sm">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-primary font-kanit mb-1">
                    {milestones.filter(m => m.achieved).length}
                  </div>
                  <p className="text-xs text-gray-600 font-sarabun">เป้าหมายสำเร็จ</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="trends" className="space-y-4">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-base font-kanit">แนวโน้มอารมณ์</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-sarabun">สัปดาห์นี้</span>
                  <Badge variant={trends.trend === 'improving' ? 'default' : 
                                trends.trend === 'declining' ? 'destructive' : 'secondary'}>
                    {trends.trend === 'improving' ? '📈 ดีขึ้น' : 
                     trends.trend === 'declining' ? '📉 ลดลง' : '➡️ คงที่'}
                  </Badge>
                </div>
                
                <div className="space-y-3">
                  {['great', 'okay', 'struggling', 'crisis'].map((mood) => {
                    const count = moodHistory.filter(m => m.mood === mood).length;
                    const percentage = Math.round((count / Math.max(moodHistory.length, 1)) * 100);
                    
                    return (
                      <div key={mood} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="font-sarabun">
                            {mood === 'great' ? 'วันที่ดี' : 
                             mood === 'okay' ? 'วันปกติ' : 
                             mood === 'struggling' ? 'วันที่ท้าทาย' : 'วันยากลำบาก'}
                          </span>
                          <span className="text-gray-600">{percentage}%</span>
                        </div>
                        <Progress value={percentage} className="h-2" />
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="goals" className="space-y-4">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-base font-kanit">เป้าหมายการฟื้นฟู</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {milestones.map((milestone) => {
                    const progress = Math.min((recoveryDays / milestone.targetDays) * 100, 100);
                    
                    return (
                      <div key={milestone.id} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-sm font-kanit">{milestone.title}</span>
                          <Badge variant={milestone.achieved ? 'default' : 'outline'}>
                            {milestone.achieved ? '✅ สำเร็จ' : `${Math.round(progress)}%`}
                          </Badge>
                        </div>
                        <Progress value={progress} className="h-2" />
                        <p className="text-xs text-gray-600 font-sarabun">
                          เป้าหมาย: {milestone.targetDays} วัน
                          {milestone.achieved && milestone.achievedAt && (
                            <span className="ml-2">
                              (สำเร็จแล้วเมื่อ {new Date(milestone.achievedAt).toLocaleDateString('th-TH')})
                            </span>
                          )}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <BottomNavigation currentTab="analytics" />
    </div>
  );
}