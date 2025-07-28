import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import BottomNavigation from "@/components/BottomNavigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { Milestone, MoodEntry } from "@shared/schema";

const createGoalSchema = z.object({
  title: z.string().min(1, "กรุณาใส่ชื่อเป้าหมาย"),
  description: z.string().optional(),
  targetDays: z.number().min(1, "จำนวนวันต้องมากกว่า 0"),
  category: z.string().min(1, "กรุณาเลือกประเภท"),
});

type CreateGoalForm = z.infer<typeof createGoalSchema>;

export default function GoalSetting() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: milestones = [] } = useQuery<Milestone[]>({
    queryKey: ["/api/milestones"],
    enabled: !!user,
  });

  const { data: moodHistory = [] } = useQuery<MoodEntry[]>({
    queryKey: ["/api/mood/history"],
    enabled: !!user,
  });

  const form = useForm<CreateGoalForm>({
    resolver: zodResolver(createGoalSchema),
    defaultValues: {
      title: "",
      description: "",
      targetDays: 30,
      category: "",
    },
  });

  const createGoalMutation = useMutation({
    mutationFn: async (data: CreateGoalForm) => {
      const response = await apiRequest("POST", "/api/milestones", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/milestones"] });
      toast({
        title: "สร้างเป้าหมายสำเร็จ",
        description: "เป้าหมายใหม่ของคุณถูกเพิ่มแล้ว",
      });
      setIsDialogOpen(false);
      form.reset();
    },
    onError: () => {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถสร้างเป้าหมายได้",
        variant: "destructive",
      });
    },
  });

  const achieveGoalMutation = useMutation({
    mutationFn: async (goalId: string) => {
      const response = await apiRequest("PATCH", `/api/milestones/${goalId}/achieve`, {});
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/milestones"] });
      toast({
        title: "ยินดีด้วย! 🎉",
        description: "คุณบรรลุเป้าหมายแล้ว",
      });
    },
    onError: () => {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถอัปเดตเป้าหมายได้",
        variant: "destructive",
      });
    },
  });

  const calculateRecoveryDays = () => {
    if (!user || !(user as any)?.recoveryStartDate) return 0;
    const startDate = new Date((user as any).recoveryStartDate);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - startDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getSmartGoalSuggestions = () => {
    const recoveryDays = calculateRecoveryDays();
    const achievedMilestones = milestones.filter(m => m.achieved).length;
    const recentMoodScore = moodHistory.slice(-7).reduce((acc, mood) => {
      const scores = { great: 4, okay: 3, struggling: 2, crisis: 1 };
      return acc + (scores[mood.mood as keyof typeof scores] || 0);
    }, 0) / Math.max(moodHistory.slice(-7).length, 1);

    const suggestions = [
      {
        title: "7 วันแห่งความมีความสุข",
        description: "ติดต่อกัน 7 วันของการมีอารมณ์ดี",
        targetDays: recoveryDays + 7,
        category: "mood",
        difficulty: "easy",
        reasoning: "เริ่มต้นด้วยเป้าหมายสั้นๆ เพื่อสร้างความมั่นใจ"
      },
      {
        title: "30 วันของการฟื้นฟู",
        description: "ครบรอบ 1 เดือนแห่งการดูแลตัวเอง",
        targetDays: Math.max(30, recoveryDays + 30),
        category: "recovery",
        difficulty: "medium",
        reasoning: "เป้าหมายระยะกลางที่ท้าทายแต่ทำได้"
      },
      {
        title: "100 วันแกร่ง",
        description: "พิสูจน์ความแกร่งของตัวเองใน 100 วัน",
        targetDays: Math.max(100, recoveryDays + 100),
        category: "milestone",
        difficulty: "hard",
        reasoning: "เป้าหมายใหญ่ที่จะสร้างความภาคภูมิใจ"
      }
    ];

    if (recentMoodScore >= 3.5) {
      suggestions.push({
        title: "สัปดาห์แห่งการให้",
        description: "ช่วยเหลือผู้อื่นในชุมชนการฟื้นฟู",
        targetDays: recoveryDays + 7,
        category: "community",
        difficulty: "medium",
        reasoning: "คุณมีอารมณ์ดี เหมาะสำหรับการช่วยเหลือผู้อื่น"
      });
    }

    if (achievedMilestones >= 3) {
      suggestions.push({
        title: "พี่เลี้ยงมือใหม่",
        description: "แนะนำและสนับสนุนสมาชิกใหม่",
        targetDays: recoveryDays + 14,
        category: "mentorship",
        difficulty: "medium",
        reasoning: "คุณมีประสบการณ์เพียงพอที่จะเป็นแรงบันดาลใจให้ผู้อื่น"
      });
    }

    return suggestions;
  };

  const onSubmit = (data: CreateGoalForm) => {
    createGoalMutation.mutate(data);
  };

  const recoveryDays = calculateRecoveryDays();
  const smartSuggestions = getSmartGoalSuggestions();

  return (
    <div className="min-h-screen bg-bg-soft">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-lg font-semibold text-primary font-kanit">
            ตั้งเป้าหมาย
          </h1>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-primary text-white">
                <i className="fas fa-plus mr-2"></i>
                เป้าหมายใหม่
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md mx-auto">
              <DialogHeader>
                <DialogTitle className="font-kanit">สร้างเป้าหมายใหม่</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-sarabun">ชื่อเป้าหมาย</FormLabel>
                        <FormControl>
                          <Input placeholder="เช่น 30 วันแห่งความสุข" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-sarabun">รายละเอียด (ไม่บังคับ)</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="อธิบายเป้าหมายของคุณ..."
                            className="resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-sarabun">ประเภท</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="เลือกประเภทเป้าหมาย" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="mood">อารมณ์</SelectItem>
                            <SelectItem value="recovery">การฟื้นฟู</SelectItem>
                            <SelectItem value="milestone">ความสำเร็จ</SelectItem>
                            <SelectItem value="community">ชุมชน</SelectItem>
                            <SelectItem value="health">สุขภาพ</SelectItem>
                            <SelectItem value="learning">การเรียนรู้</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="targetDays"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-sarabun">เป้าหมาย (วัน)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min="1"
                            placeholder="30"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex space-x-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => setIsDialogOpen(false)}
                    >
                      ยกเลิก
                    </Button>
                    <Button 
                      type="submit" 
                      className="flex-1 bg-primary text-white"
                      disabled={createGoalMutation.isPending}
                    >
                      {createGoalMutation.isPending ? "กำลังสร้าง..." : "สร้างเป้าหมาย"}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <main className="max-w-md mx-auto pb-20 p-4">
        {/* Smart Suggestions */}
        <section className="mb-6">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-kanit flex items-center">
                <i className="fas fa-lightbulb text-accent mr-2"></i>
                เป้าหมายที่แนะนำสำหรับคุณ
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {smartSuggestions.map((suggestion, index) => (
                  <div key={index} className="border border-gray-200 rounded-card p-3">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="font-medium font-kanit">{suggestion.title}</h4>
                        <p className="text-sm text-gray-600 font-sarabun mb-2">
                          {suggestion.description}
                        </p>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className="text-xs">
                            {suggestion.targetDays} วัน
                          </Badge>
                          <Badge 
                            variant={suggestion.difficulty === 'easy' ? 'default' : 
                                   suggestion.difficulty === 'medium' ? 'secondary' : 'destructive'}
                            className="text-xs"
                          >
                            {suggestion.difficulty === 'easy' ? 'ง่าย' : 
                             suggestion.difficulty === 'medium' ? 'ปานกลาง' : 'ท้าทาย'}
                          </Badge>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          form.setValue('title', suggestion.title);
                          form.setValue('description', suggestion.description);
                          form.setValue('targetDays', suggestion.targetDays);
                          form.setValue('category', suggestion.category);
                          setIsDialogOpen(true);
                        }}
                      >
                        เลือก
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500 italic font-sarabun">
                      💡 {suggestion.reasoning}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Current Goals */}
        <section className="mb-6">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-kanit">เป้าหมายปัจจุบัน</CardTitle>
            </CardHeader>
            <CardContent>
              {milestones.length === 0 ? (
                <div className="text-center py-6 text-gray-500">
                  <i className="fas fa-bullseye text-4xl mb-3 text-gray-300"></i>
                  <p className="font-sarabun">ยังไม่มีเป้าหมาย</p>
                  <p className="text-sm font-sarabun">เริ่มต้นด้วยการสร้างเป้าหมายแรกของคุณ</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {milestones.map((milestone) => {
                    const progress = Math.min((recoveryDays / milestone.targetDays) * 100, 100);
                    const daysLeft = Math.max(milestone.targetDays - recoveryDays, 0);
                    
                    return (
                      <div key={milestone.id} className="border border-gray-200 rounded-card p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h4 className="font-medium font-kanit">{milestone.title}</h4>
                            {milestone.description && (
                              <p className="text-sm text-gray-600 mt-1 font-sarabun">
                                {milestone.description}
                              </p>
                            )}
                          </div>
                          {!milestone.achieved && progress >= 100 && (
                            <Button
                              size="sm"
                              className="bg-secondary text-white"
                              onClick={() => achieveGoalMutation.mutate(milestone.id)}
                              disabled={achieveGoalMutation.isPending}
                            >
                              <i className="fas fa-check mr-1"></i>
                              สำเร็จแล้ว
                            </Button>
                          )}
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="font-sarabun">ความก้าวหน้า</span>
                            <span className="font-medium">
                              {milestone.achieved ? 'สำเร็จแล้ว' : `${Math.round(progress)}%`}
                            </span>
                          </div>
                          
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full transition-all duration-500 ${
                                milestone.achieved ? 'bg-secondary' : 'bg-primary'
                              }`}
                              style={{ width: `${Math.min(progress, 100)}%` }}
                            ></div>
                          </div>

                          <div className="flex justify-between text-xs text-gray-500 font-sarabun">
                            <span>เป้าหมาย: {milestone.targetDays} วัน</span>
                            {milestone.achieved ? (
                              milestone.achievedAt && (
                                <span>สำเร็จเมื่อ: {new Date(milestone.achievedAt).toLocaleDateString('th-TH')}</span>
                              )
                            ) : (
                              <span>เหลืออีก: {daysLeft} วัน</span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </section>
      </main>

      <BottomNavigation currentTab="goals" />
    </div>
  );
}