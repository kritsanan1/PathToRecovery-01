import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import BottomNavigation from "@/components/BottomNavigation";
import type { Doctor, Consultation } from "@shared/schema";

export default function Doctors() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedSpecialization, setSelectedSpecialization] = useState<string>('');
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [showBooking, setShowBooking] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [consultationType, setConsultationType] = useState<string>('text_chat');

  const { data: doctors = [], isLoading: doctorsLoading } = useQuery<Doctor[]>({
    queryKey: ["/api/doctors", selectedSpecialization],
    enabled: !!user,
  });

  const { data: consultations = [], isLoading: consultationsLoading } = useQuery<Consultation[]>({
    queryKey: ["/api/consultations"],
    enabled: !!user,
  });

  const bookConsultationMutation = useMutation({
    mutationFn: async (consultationData: any) => {
      const response = await apiRequest("POST", "/api/consultations", consultationData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/consultations"] });
      setShowBooking(false);
      setSelectedDoctor(null);
      toast({
        title: "จองการปรึกษาสำเร็จ!",
        description: "ระบบจะแจ้งให้ทราบเมื่อถึงเวลานัดหมาย",
      });
    },
    onError: () => {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถจองการปรึกษาได้",
        variant: "destructive",
      });
    }
  });

  const handleBookConsultation = () => {
    if (!selectedDoctor || !selectedDate || !selectedTime) return;

    const scheduledTime = new Date(selectedDate);
    const [hours, minutes] = selectedTime.split(':');
    scheduledTime.setHours(parseInt(hours), parseInt(minutes));

    bookConsultationMutation.mutate({
      doctorId: selectedDoctor.id,
      scheduledTime: scheduledTime.toISOString(),
      consultationType,
      duration: 60,
      cost: selectedDoctor.consultationRate || 1500
    });
  };

  const getSpecializationLabel = (specialization: string) => {
    switch (specialization) {
      case 'addiction_medicine': return 'แพทย์เวชศาสตร์การเสพติด';
      case 'psychiatry': return 'จิตแพทย์';
      case 'counseling': return 'นักจิตวิทยาให้คำปรึกษา';
      default: return specialization;
    }
  };

  const getConsultationTypeLabel = (type: string) => {
    switch (type) {
      case 'text_chat': return 'แชทข้อความ';
      case 'video_call': return 'วิดีโอคอล';
      case 'voice_call': return 'โทรศัพท์';
      default: return type;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'scheduled': return 'รอการปรึกษา';
      case 'in_progress': return 'กำลังปรึกษา';
      case 'completed': return 'เสร็จสิ้น';
      case 'cancelled': return 'ยกเลิก';
      default: return status;
    }
  };

  const timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
    '16:00', '16:30', '17:00', '17:30', '18:00', '18:30'
  ];

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <p className="text-lg font-sarabun">กรุณาเข้าสู่ระบบ</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 pb-20">
      <div className="max-w-md mx-auto pt-8 px-4">
        <header className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800 font-kanit">ปรึกษาแพทย์</h1>
          <p className="text-gray-600 font-sarabun">เชื่อมต่อกับแพทย์ผู้เชี่ยวชาญด้านการฟื้นฟู</p>
        </header>

        <Tabs defaultValue="doctors" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="doctors" className="font-sarabun">แพทย์</TabsTrigger>
            <TabsTrigger value="appointments" className="font-sarabun">นัดหมาย</TabsTrigger>
          </TabsList>

          <TabsContent value="doctors" className="space-y-4">
            {/* Specialization Filter */}
            <Card>
              <CardContent className="p-4">
                <label className="text-sm font-medium font-sarabun block mb-2">เลือกความเชี่ยวชาญ</label>
                <Select value={selectedSpecialization} onValueChange={setSelectedSpecialization}>
                  <SelectTrigger className="font-sarabun">
                    <SelectValue placeholder="ทุกสาขา" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">ทุกสาขา</SelectItem>
                    <SelectItem value="addiction_medicine">แพทย์เวชศาสตร์การเสพติด</SelectItem>
                    <SelectItem value="psychiatry">จิตแพทย์</SelectItem>
                    <SelectItem value="counseling">นักจิตวิทยาให้คำปรึกษา</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* Doctors List */}
            {doctorsLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-32 bg-white/50 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {doctors.map((doctor) => (
                  <Card key={doctor.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <Avatar className="w-12 h-12">
                          <AvatarFallback className="bg-primary text-white font-kanit">
                            Dr
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-semibold font-kanit">แพทย์ผู้เชี่ยวชาญ</h3>
                              <Badge className="mb-2">
                                {getSpecializationLabel(doctor.specialization)}
                              </Badge>
                              <p className="text-sm text-gray-600 font-sarabun mb-2">
                                {doctor.bio || "ประสบการณ์ด้านการฟื้นฟูจากการเสพติด"}
                              </p>
                              
                              <div className="flex items-center gap-4 text-xs text-gray-500 font-sarabun">
                                <span>⭐ {doctor.rating}/5</span>
                                <span>📅 {doctor.totalConsultations} ครั้ง</span>
                                <span>💰 ฿{doctor.consultationRate}/ชั่วโมง</span>
                              </div>
                            </div>
                          </div>
                          
                          {doctor.languages && doctor.languages.length > 0 && (
                            <div className="flex gap-1 mt-2">
                              {doctor.languages.map((lang, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  {lang === 'thai' ? '🇹🇭 ไทย' : '🇺🇸 English'}
                                </Badge>
                              ))}
                            </div>
                          )}
                          
                          <Button
                            onClick={() => {
                              setSelectedDoctor(doctor);
                              setShowBooking(true);
                            }}
                            className="w-full mt-3 font-sarabun"
                            disabled={!doctor.isAvailable}
                          >
                            {doctor.isAvailable ? 'จองการปรึกษา' : 'ไม่ว่าง'}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                
                {doctors.length === 0 && (
                  <div className="text-center py-8">
                    <i className="fas fa-user-md text-4xl text-gray-400 mb-4"></i>
                    <p className="text-gray-600 font-sarabun">ไม่พบแพทย์ในหมวดหมู่นี้</p>
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="appointments" className="space-y-4">
            {consultationsLoading ? (
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <div key={i} className="h-24 bg-white/50 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {consultations.map((consultation) => (
                  <Card key={consultation.id}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-semibold font-kanit">การปรึกษา</h3>
                          <p className="text-sm text-gray-600 font-sarabun">
                            {getConsultationTypeLabel(consultation.consultationType)}
                          </p>
                        </div>
                        <Badge className={getStatusColor(consultation.status)}>
                          {getStatusLabel(consultation.status)}
                        </Badge>
                      </div>
                      
                      <div className="space-y-1 text-sm text-gray-600 font-sarabun">
                        <p>📅 {new Date(consultation.scheduledTime).toLocaleDateString('th-TH')}</p>
                        <p>🕐 {new Date(consultation.scheduledTime).toLocaleTimeString('th-TH', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}</p>
                        <p>💰 ฿{consultation.cost}</p>
                      </div>
                      
                      {consultation.status === 'scheduled' && (
                        <Button variant="outline" size="sm" className="w-full mt-3 font-sarabun">
                          เข้าร่วมการปรึกษา
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
                
                {consultations.length === 0 && (
                  <div className="text-center py-8">
                    <i className="fas fa-calendar-alt text-4xl text-gray-400 mb-4"></i>
                    <p className="text-gray-600 font-sarabun">ยังไม่มีการนัดหมาย</p>
                  </div>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Booking Dialog */}
        <Dialog open={showBooking} onOpenChange={setShowBooking}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle className="font-kanit">จองการปรึกษา</DialogTitle>
            </DialogHeader>
            
            {selectedDoctor && (
              <div className="space-y-4">
                <div className="text-center">
                  <h3 className="font-semibold font-kanit">แพทย์ผู้เชี่ยวชาญ</h3>
                  <Badge>{getSpecializationLabel(selectedDoctor.specialization)}</Badge>
                </div>
                
                <div>
                  <label className="text-sm font-medium font-sarabun">ประเภทการปรึกษา</label>
                  <Select value={consultationType} onValueChange={setConsultationType}>
                    <SelectTrigger className="font-sarabun">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text_chat">แชทข้อความ</SelectItem>
                      <SelectItem value="voice_call">โทรศัพท์</SelectItem>
                      <SelectItem value="video_call">วิดีโอคอล</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm font-medium font-sarabun">เลือกวันที่</label>
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    disabled={(date) => date < new Date()}
                    className="rounded-md border"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium font-sarabun">เลือกเวลา</label>
                  <Select value={selectedTime} onValueChange={setSelectedTime}>
                    <SelectTrigger className="font-sarabun">
                      <SelectValue placeholder="เลือกเวลา" />
                    </SelectTrigger>
                    <SelectContent>
                      {timeSlots.map((time) => (
                        <SelectItem key={time} value={time}>{time}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex justify-between items-center text-sm font-sarabun">
                    <span>ค่าบริการ:</span>
                    <span className="font-semibold">฿{selectedDoctor.consultationRate}/ชั่วโมง</span>
                  </div>
                </div>
                
                <Button
                  onClick={handleBookConsultation}
                  disabled={bookConsultationMutation.isPending || !selectedDate || !selectedTime}
                  className="w-full font-sarabun"
                >
                  {bookConsultationMutation.isPending ? "กำลังจอง..." : "ยืนยันการจอง"}
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>

      <BottomNavigation currentTab="doctors" />
    </div>
  );
}