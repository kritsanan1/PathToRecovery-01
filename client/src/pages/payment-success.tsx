import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import BottomNavigation from "@/components/BottomNavigation";

export default function PaymentSuccess() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState<'success' | 'processing' | 'failed'>('processing');

  useEffect(() => {
    // Get payment intent from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const paymentIntent = urlParams.get('payment_intent');
    const paymentIntentClientSecret = urlParams.get('payment_intent_client_secret');

    if (paymentIntent) {
      // Check payment status
      checkPaymentStatus(paymentIntent);
    } else {
      setPaymentStatus('failed');
      setIsLoading(false);
    }
  }, []);

  const checkPaymentStatus = async (paymentIntentId: string) => {
    try {
      const response = await fetch(`/api/payment-status/${paymentIntentId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}` // If using token-based auth
        }
      });
      
      const data = await response.json();
      
      if (data.status === 'succeeded') {
        setPaymentStatus('success');
        toast({
          title: "ชำระเงินสำเร็จ! 🎉",
          description: "ยินดีต้อนรับสู่ RecoveryPath Premium",
        });
      } else if (data.status === 'processing') {
        setPaymentStatus('processing');
      } else {
        setPaymentStatus('failed');
      }
    } catch (error) {
      console.error('Error checking payment status:', error);
      setPaymentStatus('failed');
    } finally {
      setIsLoading(false);
    }
  };

  const premiumFeatures = [
    {
      icon: 'fas fa-chart-line',
      title: 'การวิเคราะห์ขั้นสูง',
      description: 'ข้อมูลเชิงลึกเกี่ยวกับความก้าวหน้าในการฟื้นฟู'
    },
    {
      icon: 'fas fa-bullseye',
      title: 'เป้าหมายที่ปรับแต่งได้',
      description: 'สร้างเป้าหมายส่วนบุคคลตามความต้องการของคุณ'
    },
    {
      icon: 'fas fa-bell',
      title: 'การแจ้งเตือนอัจฉริยะ',
      description: 'รับการแจ้งเตือนที่เหมาะสมกับสถานการณ์ของคุณ'
    },
    {
      icon: 'fas fa-heart',
      title: 'การสนับสนุนลำดับความสำคัญ',
      description: 'รับความช่วยเหลือและการตอบกลับอย่างรวดเร็ว'
    }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg-soft flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <i className="fas fa-spinner fa-spin text-white text-2xl"></i>
          </div>
          <p className="text-text-dark font-kanit">กำลังตรวจสอบการชำระเงิน...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-soft">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-md mx-auto px-4 py-3">
          <h1 className="text-lg font-semibold text-primary font-kanit text-center">
            {paymentStatus === 'success' ? 'ชำระเงินสำเร็จ' : 
             paymentStatus === 'processing' ? 'กำลังประมวลผล' : 'เกิดข้อผิดพลาด'}
          </h1>
        </div>
      </header>

      <main className="max-w-md mx-auto pb-20 p-4">
        {paymentStatus === 'success' && (
          <>
            {/* Success Message */}
            <section className="mb-6">
              <Card className="shadow-sm border-secondary/30 bg-secondary/5">
                <CardContent className="pt-6 text-center">
                  <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="fas fa-check text-white text-3xl"></i>
                  </div>
                  <h2 className="text-xl font-semibold mb-2 font-kanit text-secondary">
                    ยินดีด้วย! คุณเป็นสมาชิก Premium แล้ว
                  </h2>
                  <p className="text-gray-600 font-sarabun">
                    ขอบคุณสำหรับการสมัครสมาชิก Premium ตอนนี้คุณสามารถใช้ฟีเจอร์พิเศษทั้งหมดได้แล้ว
                  </p>
                </CardContent>
              </Card>
            </section>

            {/* Premium Features */}
            <section className="mb-6">
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="font-kanit">ฟีเจอร์ Premium ที่คุณได้รับ</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {premiumFeatures.map((feature, index) => (
                      <div key={index} className="flex items-start space-x-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                          <i className={`${feature.icon} text-primary`}></i>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium font-kanit">{feature.title}</h4>
                          <p className="text-sm text-gray-600 font-sarabun">{feature.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Next Steps */}
            <section className="mb-6">
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="font-kanit">เริ่มต้นใช้งาน Premium</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    onClick={() => setLocation('/analytics')}
                    className="w-full bg-primary text-white"
                  >
                    <i className="fas fa-chart-line mr-2"></i>
                    ดูการวิเคราะห์ขั้นสูง
                  </Button>
                  <Button 
                    onClick={() => setLocation('/goals')}
                    variant="outline"
                    className="w-full"
                  >
                    <i className="fas fa-bullseye mr-2"></i>
                    ตั้งเป้าหมายใหม่
                  </Button>
                  <Button 
                    onClick={() => setLocation('/')}
                    variant="outline"
                    className="w-full"
                  >
                    <i className="fas fa-home mr-2"></i>
                    กลับหน้าหลัก
                  </Button>
                </CardContent>
              </Card>
            </section>
          </>
        )}

        {paymentStatus === 'processing' && (
          <section className="mb-6">
            <Card className="shadow-sm border-amber-200 bg-amber-50">
              <CardContent className="pt-6 text-center">
                <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-clock text-amber-600 text-3xl"></i>
                </div>
                <h2 className="text-xl font-semibold mb-2 font-kanit text-amber-700">
                  กำลังประมวลผลการชำระเงิน
                </h2>
                <p className="text-amber-600 font-sarabun mb-4">
                  การชำระเงินของคุณอยู่ระหว่างการประมวลผล โปรดรอสักครู่
                </p>
                <Button 
                  onClick={() => window.location.reload()}
                  variant="outline"
                  className="border-amber-300 text-amber-700"
                >
                  ตรวจสอบสถานะอีกครั้ง
                </Button>
              </CardContent>
            </Card>
          </section>
        )}

        {paymentStatus === 'failed' && (
          <section className="mb-6">
            <Card className="shadow-sm border-red-200 bg-red-50">
              <CardContent className="pt-6 text-center">
                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-times text-red-600 text-3xl"></i>
                </div>
                <h2 className="text-xl font-semibold mb-2 font-kanit text-red-700">
                  การชำระเงินไม่สำเร็จ
                </h2>
                <p className="text-red-600 font-sarabun mb-4">
                  เกิดข้อผิดพลาดในการประมวลผลการชำระเงิน กรุณาลองใหม่อีกครั้ง
                </p>
                <div className="space-y-2">
                  <Button 
                    onClick={() => setLocation('/payment')}
                    className="w-full bg-red-600 text-white"
                  >
                    ลองชำระเงินอีกครั้ง
                  </Button>
                  <Button 
                    onClick={() => setLocation('/')}
                    variant="outline"
                    className="w-full border-red-300 text-red-700"
                  >
                    กลับหน้าหลัก
                  </Button>
                </div>
              </CardContent>
            </Card>
          </section>
        )}
      </main>

      <BottomNavigation currentTab="" />
    </div>
  );
}