import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import BottomNavigation from "@/components/BottomNavigation";
import CrisisModal from "@/components/CrisisModal";
import BreathingExercise from "@/components/BreathingExercise";
import ProgressChart from "@/components/ProgressChart";
import SmartNotificationSystem from "@/components/SmartNotificationSystem";
import type { User, MoodEntry, Milestone, Resource, CommunityPost } from "@shared/schema";

export default function Home() {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const [showCrisis, setShowCrisis] = useState(false);
  const [showBreathing, setShowBreathing] = useState(false);
  const [selectedMood, setSelectedMood] = useState<string | null>(null);

  // Fetch today's mood
  const { data: todayMood } = useQuery({
    queryKey: ["/api/mood/today"],
    enabled: !!user,
  });

  // Fetch milestones
  const { data: milestones = [] } = useQuery<Milestone[]>({
    queryKey: ["/api/milestones"],
    enabled: !!user,
  });

  // Fetch recent resources
  const { data: resources = [] } = useQuery<Resource[]>({
    queryKey: ["/api/resources"],
    enabled: !!user,
  });

  // Fetch community posts
  const { data: communityPosts = [] } = useQuery<CommunityPost[]>({
    queryKey: ["/api/community/posts"],
    enabled: !!user,
  });

  // Mood submission mutation
  const moodMutation = useMutation({
    mutationFn: async (mood: string) => {
      const response = await apiRequest("POST", "/api/mood", { mood });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/mood/today"] });
      toast({
        title: "บันทึกอารมณ์แล้ว",
        description: "ขอบคุณที่แบ่งปันความรู้สึกของคุณ",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถบันทึกอารมณ์ได้",
        variant: "destructive",
      });
    },
  });

  const handleMoodSelect = (mood: string) => {
    setSelectedMood(mood);
    moodMutation.mutate(mood);
  };

  const calculateRecoveryDays = () => {
    if (!user || !(user as any)?.recoveryStartDate) return 0;
    const startDate = new Date((user as any).recoveryStartDate);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - startDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const calculateProgress = () => {
    const days = calculateRecoveryDays();
    const nextMilestone = milestones.find(m => !m.achieved);
    if (!nextMilestone) return 100;
    return Math.min((days / nextMilestone.targetDays) * 100, 100);
  };

  useEffect(() => {
    if (todayMood && (todayMood as any)?.mood) {
      setSelectedMood((todayMood as any).mood);
    }
  }, [todayMood]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-soft">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  const recoveryDays = calculateRecoveryDays();
  const progressPercent = calculateProgress();

  return (
    <div className="min-h-screen bg-bg-soft">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center">
              <i className="fas fa-heart text-white text-sm"></i>
            </div>
            <h1 className="text-lg font-semibold text-primary font-kanit">RecoveryPath</h1>
          </div>
          <div className="flex items-center space-x-3">
            <SmartNotificationSystem />
            {(user as any)?.profileImageUrl && (
              <img 
                src={(user as any).profileImageUrl} 
                alt="Profile picture" 
                className="w-8 h-8 rounded-full object-cover border-2 border-support" 
              />
            )}
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto pb-20">
        {/* Welcome Section */}
        <section className="p-4 bg-gradient-to-br from-support to-white">
          <div className="bg-white/70 backdrop-blur-sm rounded-card p-4 mb-4">
            <h2 className="text-xl font-semibold mb-2 font-kanit">
              สวัสดี {(user as any)?.firstName || 'คุณ'}
            </h2>
            <p className="text-gray-600 text-sm mb-4 font-sarabun">
              วันนี้เป็นวันที่ <span className="font-medium text-secondary">{recoveryDays}</span> ของการฟื้นฟูของคุณ
            </p>
            
            {/* Daily mood check-in */}
            <div className="bg-support/50 rounded-card p-3 mb-4">
              <p className="text-sm font-medium mb-2 font-kanit">วันนี้คุณรู้สึกอย่างไร?</p>
              <div className="flex space-x-2">
                {[
                  { mood: 'great', emoji: '😊', bg: 'bg-secondary/20 hover:bg-secondary/30' },
                  { mood: 'okay', emoji: '😐', bg: 'bg-yellow-100 hover:bg-yellow-200' },
                  { mood: 'struggling', emoji: '😔', bg: 'bg-orange-100 hover:bg-orange-200' },
                  { mood: 'crisis', emoji: '😰', bg: 'bg-red-100 hover:bg-red-200' }
                ].map(({ mood, emoji, bg }) => (
                  <Button
                    key={mood}
                    onClick={() => handleMoodSelect(mood)}
                    disabled={moodMutation.isPending}
                    className={`w-10 h-10 rounded-full ${bg} transition-colors flex items-center justify-center p-0 ${
                      selectedMood === mood ? 'ring-2 ring-primary' : ''
                    }`}
                    variant="ghost"
                  >
                    {emoji}
                  </Button>
                ))}
              </div>
            </div>

            {/* Progress ring */}
            <div className="flex items-center justify-center mb-4">
              <div className="relative w-24 h-24">
                <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="45" stroke="var(--support)" strokeWidth="6" fill="none"/>
                  <circle 
                    cx="50" cy="50" r="45" 
                    stroke="var(--secondary)" 
                    strokeWidth="6" 
                    fill="none" 
                    strokeDasharray="283" 
                    strokeDashoffset={283 - (283 * progressPercent / 100)} 
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg font-semibold text-secondary font-kanit">
                    {Math.round(progressPercent)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Actions */}
        <section className="px-4 mb-6">
          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={() => setShowCrisis(true)}
              className="bg-gradient-to-br from-red-500 to-red-600 text-white p-4 rounded-card shadow-lg hover:from-red-600 hover:to-red-700 transition-all transform hover:scale-105 h-auto flex flex-col space-y-2"
            >
              <i className="fas fa-phone text-xl"></i>
              <div className="text-center">
                <p className="font-medium text-sm font-kanit">ขอความช่วยเหลือ</p>
                <p className="text-xs opacity-90 font-sarabun">1413 - 24 ชั่วโมง</p>
              </div>
            </Button>
            
            <Button
              onClick={() => setShowBreathing(true)}
              className="bg-gradient-to-br from-primary to-blue-600 text-white p-4 rounded-card shadow-lg hover:from-blue-600 hover:to-blue-700 transition-all transform hover:scale-105 h-auto flex flex-col space-y-2"
            >
              <i className="fas fa-lungs text-xl"></i>
              <div className="text-center">
                <p className="font-medium text-sm font-kanit">หายใจเข้าลึก</p>
                <p className="text-xs opacity-90 font-sarabun">ผ่อนคลาย 5 นาที</p>
              </div>
            </Button>
          </div>
        </section>

        {/* Progress Tracking */}
        <section className="px-4 mb-6">
          <Card className="shadow-sm">
            <CardContent className="p-4">
              <h3 className="text-lg font-semibold mb-4 flex items-center font-kanit">
                <i className="fas fa-chart-line text-primary mr-2"></i>
                ความก้าวหน้าของคุณ
              </h3>
              
              <div className="space-y-3 mb-4">
                {milestones.slice(0, 2).map((milestone) => (
                  <div key={milestone.id} className={`flex items-center space-x-3 p-3 rounded-card ${
                    milestone.achieved ? 'bg-support' : 'bg-gray-50'
                  }`}>
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      milestone.achieved ? 'bg-secondary' : 'bg-gray-300'
                    }`}>
                      <i className={`fas ${milestone.achieved ? 'fa-trophy' : 'fa-star'} text-white`}></i>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm font-kanit">{milestone.title}</p>
                      <p className="text-xs text-gray-600 font-sarabun">
                        {milestone.achieved 
                          ? 'เสร็จแล้ว' 
                          : `เหลืออีก ${milestone.targetDays - recoveryDays} วัน`
                        }
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`text-xs font-medium ${
                        milestone.achieved ? 'text-secondary' : 'text-accent'
                      }`}>
                        {milestone.achieved ? 'เสร็จแล้ว ✓' : `${Math.round((recoveryDays / milestone.targetDays) * 100)}%`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <ProgressChart />
            </CardContent>
          </Card>
        </section>

        {/* Premium Upgrade Banner */}
        {!(user as any)?.isPremium && (
          <section className="px-4 mb-6">
            <div className="bg-gradient-to-r from-primary to-secondary p-4 rounded-card text-white">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-medium font-kanit mb-1">อัปเกรดเป็น Premium</h3>
                  <p className="text-xs text-white/80 font-sarabun">ปลดล็อกการวิเคราะห์ขั้นสูงและฟีเจอร์พิเศษ</p>
                </div>
                <Button
                  onClick={() => setLocation('/payment')}
                  size="sm"
                  className="bg-white text-primary hover:bg-white/90 ml-3"
                >
                  <i className="fas fa-crown mr-1"></i>
                  อัปเกรด
                </Button>
              </div>
            </div>
          </section>
        )}

        {/* Premium Badge */}
        {(user as any)?.isPremium && (
          <section className="px-4 mb-6">
            <div className="bg-gradient-to-r from-amber-400 to-yellow-500 p-3 rounded-card text-white">
              <div className="flex items-center">
                <i className="fas fa-crown mr-2"></i>
                <span className="font-medium font-kanit">สมาชิก Premium</span>
                <span className="ml-auto text-xs bg-white/20 px-2 py-1 rounded-full">ใช้งานได้</span>
              </div>
            </div>
          </section>
        )}

        {/* Educational Resources */}
        <section className="px-4 mb-6">
          <Card className="shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold flex items-center font-kanit">
                  <i className="fas fa-book-open text-primary mr-2"></i>
                  แหล่งความรู้
                </h3>
                <Button variant="ghost" className="text-primary text-sm font-medium p-0">
                  ดูทั้งหมด
                </Button>
              </div>
              
              <div className="space-y-3">
                {resources.slice(0, 2).map((resource) => (
                  <div key={resource.id} className="flex space-x-3 p-3 bg-support/30 rounded-card hover:bg-support/50 transition-colors cursor-pointer">
                    {resource.imageUrl && (
                      <img 
                        src={resource.imageUrl} 
                        alt={resource.title}
                        className="w-16 h-12 rounded object-cover" 
                      />
                    )}
                    <div className="flex-1">
                      <p className="font-medium text-sm font-kanit">{resource.title}</p>
                      <p className="text-xs text-gray-600 mb-1 font-sarabun">
                        {resource.type === 'video' ? 'วิดีโอ' : 'อ่าน'} {resource.estimatedTime} นาที
                      </p>
                      <div className="flex items-center">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          resource.category === 'mental_health' 
                            ? 'bg-secondary/20 text-secondary'
                            : resource.category === 'strategy'
                            ? 'bg-accent/20 text-accent'
                            : 'bg-primary/20 text-primary'
                        }`}>
                          {resource.category === 'mental_health' ? 'สุขภาพจิต' : 
                           resource.category === 'strategy' ? 'กลยุทธ์' : 'สนับสนุน'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Community Support */}
        <section className="px-4 mb-6">
          <Card className="shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold flex items-center font-kanit">
                  <i className="fas fa-users text-primary mr-2"></i>
                  ชุมชนผู้ร่วมทาง
                </h3>
                <span className="bg-secondary/20 text-secondary text-xs px-2 py-1 rounded-full font-sarabun">
                  ออนไลน์
                </span>
              </div>
              
              <div className="space-y-3 mb-4">
                {communityPosts.slice(0, 2).map((post, index) => (
                  <div key={post.id} className="bg-support/30 rounded-card p-3">
                    <div className="flex items-start space-x-2">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        index % 2 === 0 
                          ? 'bg-gradient-to-br from-primary to-secondary'
                          : 'bg-gradient-to-br from-accent to-yellow-500'
                      }`}>
                        <span className="text-white text-xs font-medium">
                          {post.isAnonymous ? 'A' : 'U'}
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-sarabun">{post.content}</p>
                        <p className="text-xs text-gray-500 mt-1 font-sarabun">
                          {post.isAnonymous ? 'ผู้ใช้ไม่ระบุชื่อ' : 'ผู้ใช้'} • 
                          {new Date(post.createdAt || new Date()).toLocaleDateString('th-TH')}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <Button className="w-full bg-primary text-white py-2.5 rounded-card font-medium hover:bg-blue-600 transition-colors font-kanit">
                เข้าร่วมการสนทนา
              </Button>
            </CardContent>
          </Card>
        </section>

        {/* Daily Inspiration */}
        <section className="px-4 mb-6">
          <div className="bg-gradient-to-br from-accent/10 to-orange-50 rounded-card p-4 border border-accent/20">
            <div className="flex items-center mb-3">
              <i className="fas fa-quote-left text-accent mr-2"></i>
              <h3 className="font-semibold text-accent font-kanit">คำคมวันนี้</h3>
            </div>
            <blockquote className="text-sm leading-relaxed mb-3 font-sarabun">
              "การเปลี่ยนแปลงที่แท้จริงเกิดขึ้นเมื่อเราเลือกที่จะก้าวไปข้างหน้า แม้จะเจ็บปวดก็ตาม"
            </blockquote>
            <p className="text-xs text-gray-600 font-sarabun">- ภิกษุ พุทธทาส</p>
          </div>
        </section>
      </main>

      <BottomNavigation currentTab="home" />
      <CrisisModal isOpen={showCrisis} onClose={() => setShowCrisis(false)} />
      <BreathingExercise isOpen={showBreathing} onClose={() => setShowBreathing(false)} />
    </div>
  );
}
