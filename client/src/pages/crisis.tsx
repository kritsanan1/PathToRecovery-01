import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import BottomNavigation from "@/components/BottomNavigation";
import BreathingExercise from "@/components/BreathingExercise";
import { useState } from "react";
import type { EmergencyContact, RehabCenter } from "@shared/schema";

export default function Crisis() {
  const [showBreathing, setShowBreathing] = useState(false);

  const { data: emergencyContacts = [] } = useQuery<EmergencyContact[]>({
    queryKey: ["/api/emergency-contacts"],
  });

  const { data: rehabCenters = [] } = useQuery<RehabCenter[]>({
    queryKey: ["/api/rehab-centers"],
  });

  const handleCall = (phoneNumber: string) => {
    window.location.href = `tel:${phoneNumber}`;
  };

  const handleDirections = (center: RehabCenter) => {
    if (center.latitude && center.longitude) {
      window.open(`https://maps.google.com/maps?q=${center.latitude},${center.longitude}`);
    } else {
      window.open(`https://maps.google.com/maps?q=${encodeURIComponent(center.address)}`);
    }
  };

  return (
    <div className="min-h-screen bg-bg-soft">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-md mx-auto px-4 py-3">
          <h1 className="text-lg font-semibold text-red-600 font-kanit text-center">
            ความช่วยเหลือฉุกเฉิน
          </h1>
        </div>
      </header>

      <main className="max-w-md mx-auto pb-20">
        {/* Crisis Message */}
        <div className="p-4">
          <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200 shadow-sm">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-heart text-white text-2xl"></i>
              </div>
              <h2 className="text-xl font-semibold mb-2 font-kanit">คุณไม่ได้อยู่คนเดียว</h2>
              <p className="text-gray-700 text-sm font-sarabun">
                เรามีการสนับสนุนและความช่วยเหลือให้คุณ ไม่ว่าจะเป็นเวลาใดก็ตาม
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="px-4 mb-6">
          <div className="grid grid-cols-1 gap-3">
            <Button
              onClick={() => handleCall("1413")}
              className="bg-red-500 hover:bg-red-600 text-white p-4 rounded-card shadow-lg h-auto"
            >
              <div className="flex items-center space-x-4">
                <i className="fas fa-phone text-2xl"></i>
                <div className="text-left">
                  <p className="font-semibold text-lg font-kanit">โทรหาความช่วยเหลือฉุกเฉิน</p>
                  <p className="text-sm opacity-90 font-sarabun">1413 - สายด่วนสุขภาพจิต (24 ชม.)</p>
                </div>
              </div>
            </Button>
            
            <Button
              onClick={() => setShowBreathing(true)}
              className="bg-primary hover:bg-blue-600 text-white p-4 rounded-card shadow-lg h-auto"
            >
              <div className="flex items-center space-x-4">
                <i className="fas fa-lungs text-2xl"></i>
                <div className="text-left">
                  <p className="font-semibold text-lg font-kanit">แบบฝึกหายใจผ่อนคลาย</p>
                  <p className="text-sm opacity-90 font-sarabun">นำทางการหายใจ 4-7-8</p>
                </div>
              </div>
            </Button>
          </div>
        </div>

        {/* Emergency Contacts */}
        <section className="px-4 mb-6">
          <h3 className="text-lg font-semibold mb-4 font-kanit">หมายเลขฉุกเฉิน</h3>
          <div className="space-y-3">
            {emergencyContacts.map((contact) => (
              <Card key={contact.id} className="shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-12 h-12 rounded-card flex items-center justify-center ${
                        contact.category === 'hotline' ? 'bg-red-100' :
                        contact.category === 'hospital' ? 'bg-blue-100' : 'bg-green-100'
                      }`}>
                        <i className={`${
                          contact.category === 'hotline' ? 'fas fa-phone text-red-600' :
                          contact.category === 'hospital' ? 'fas fa-hospital text-blue-600' : 
                          'fas fa-user-md text-green-600'
                        } text-xl`}></i>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold font-kanit">{contact.name}</h4>
                        <p className="text-sm text-gray-600 font-sarabun">{contact.description}</p>
                        {contact.isAvailable24h && (
                          <span className="inline-block bg-green-100 text-green-600 text-xs px-2 py-1 rounded-full mt-1">
                            24 ชั่วโมง
                          </span>
                        )}
                      </div>
                    </div>
                    <Button
                      onClick={() => handleCall(contact.phoneNumber)}
                      className="bg-primary hover:bg-blue-600 text-white"
                    >
                      <i className="fas fa-phone mr-2"></i>
                      โทร
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Nearby Centers */}
        <section className="px-4 mb-6">
          <h3 className="text-lg font-semibold mb-4 font-kanit">สถานที่ใกล้เคียง</h3>
          <div className="space-y-3">
            {rehabCenters.map((center) => (
              <Card key={center.id} className="shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      <div className="w-12 h-12 bg-primary/20 rounded-card flex items-center justify-center flex-shrink-0">
                        <i className="fas fa-hospital text-primary text-xl"></i>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold font-kanit">{center.name}</h4>
                        <p className="text-sm text-gray-600 mb-2 font-sarabun">{center.address}</p>
                        
                        {center.phoneNumber && (
                          <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                            <span className="font-sarabun">
                              <i className="fas fa-phone mr-1"></i>
                              {center.phoneNumber}
                            </span>
                          </div>
                        )}
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            center.isOpen24h 
                              ? 'bg-green-100 text-green-600' 
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                            {center.isOpen24h ? '24 ชั่วโมง' : center.openingHours || 'ตามเวลาทำการ'}
                          </span>
                        </div>
                        
                        {center.services && (
                          <p className="text-xs text-gray-500 mt-2 font-sarabun">
                            {center.services}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col space-y-2 ml-2">
                      {center.phoneNumber && (
                        <Button
                          onClick={() => handleCall(center.phoneNumber!)}
                          size="sm"
                          className="bg-secondary hover:bg-green-600 text-white"
                        >
                          <i className="fas fa-phone"></i>
                        </Button>
                      )}
                      <Button
                        onClick={() => handleDirections(center)}
                        size="sm"
                        variant="outline"
                        className="text-primary border-primary hover:bg-primary/10"
                      >
                        <i className="fas fa-map-marker-alt"></i>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Self-Care Tips */}
        <section className="px-4 mb-6">
          <Card className="bg-gradient-to-br from-support to-white border-none shadow-sm">
            <CardContent className="p-4">
              <h3 className="font-semibold mb-3 font-kanit">
                <i className="fas fa-lightbulb text-accent mr-2"></i>
                เทคนิคช่วยเหลือตนเองทันที
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-primary font-semibold text-sm">1</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium font-kanit">หายใจลึกๆ</p>
                    <p className="text-xs text-gray-600 font-sarabun">หายใจเข้า 4 วิ หยุด 7 วิ หายใจออก 8 วิ</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-secondary/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-secondary font-semibold text-sm">2</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium font-kanit">ใช้เทคนิค 5-4-3-2-1</p>
                    <p className="text-xs text-gray-600 font-sarabun">มองเห็น 5 สิ่ง สัมผัส 4 สิ่ง ได้ยิน 3 เสียง ได้กลิ่น 2 อย่าง ลิ้มรส 1 อย่าง</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-accent/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-accent font-semibold text-sm">3</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium font-kanit">โทรหาคนที่ไว้ใจได้</p>
                    <p className="text-xs text-gray-600 font-sarabun">แบ่งปันความรู้สึกกับคนที่เข้าใจ</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>

      <BottomNavigation currentTab="crisis" />
      <BreathingExercise isOpen={showBreathing} onClose={() => setShowBreathing(false)} />
    </div>
  );
}
