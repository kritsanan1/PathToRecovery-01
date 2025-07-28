import { useState, useEffect } from "react";
import { useStripe, Elements, PaymentElement, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import BottomNavigation from "@/components/BottomNavigation";

// Make sure to call `loadStripe` outside of a component's render to avoid
// recreating the `Stripe` object on every render.
if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  throw new Error('Missing required Stripe key: VITE_STRIPE_PUBLIC_KEY');
}
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

interface PaymentFormProps {
  paymentType: 'card' | 'qr';
  amount: number;
  productName: string;
}

const PaymentForm = ({ paymentType, amount, productName }: PaymentFormProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment-success`,
        },
      });

      if (error) {
        toast({
          title: "การชำระเงินล้มเหลว",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "ชำระเงินสำเร็จ!",
          description: "ขอบคุณสำหรับการสมัครสมาชิก Premium",
        });
      }
    } catch (error) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถประมวลผลการชำระเงินได้",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      <Button 
        type="submit" 
        className="w-full bg-primary text-white"
        disabled={!stripe || processing}
      >
        {processing ? (
          <>
            <i className="fas fa-spinner fa-spin mr-2"></i>
            กำลังประมวลผล...
          </>
        ) : (
          <>
            <i className={`fas ${paymentType === 'qr' ? 'fa-qrcode' : 'fa-credit-card'} mr-2`}></i>
            ชำระเงิน ฿{amount.toLocaleString()}
          </>
        )}
      </Button>
    </form>
  );
};

export default function Payment() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [clientSecret, setClientSecret] = useState("");
  const [qrClientSecret, setQrClientSecret] = useState("");
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('monthly');
  const [paymentType, setPaymentType] = useState<'card' | 'qr'>('card');
  const [loading, setLoading] = useState(false);

  const plans = {
    monthly: {
      name: 'Premium รายเดือน',
      price: 199,
      currency: 'THB',
      description: 'การวิเคราะห์ขั้นสูง และคำแนะนำส่วนบุคคล',
      features: [
        'การวิเคราะห์อารมณ์แบบละเอียด',
        'เป้าหมายที่ปรับแต่งได้',
        'การแจ้งเตือนอัจฉริยะ',
        'รายงานความก้าวหน้าขั้นสูง',
        'การสนับสนุนลำดับความสำคัญ'
      ]
    },
    yearly: {
      name: 'Premium รายปี',
      price: 1990,
      originalPrice: 2388,
      currency: 'THB',
      description: 'ประหยัด 17% เมื่อชำระรายปี',
      features: [
        'ทุกฟีเจอร์ของแผนรายเดือน',
        'การปรึกษาส่วนตัว 1:1 (รายเดือน)',
        'เนื้อหาพิเศษและคู่มือฟื้นฟู',
        'การเข้าถึงชุมชน VIP',
        'ส่วนลด 17% จากราคาปกติ'
      ]
    }
  };

  const currentPlan = plans[selectedPlan];

  const createPaymentIntent = async (isQrPayment = false) => {
    setLoading(true);
    try {
      const endpoint = isQrPayment ? '/api/create-qr-payment' : '/api/create-payment-intent';
      const response = await apiRequest("POST", endpoint, {
        amount: currentPlan.price,
        currency: currentPlan.currency,
        productName: currentPlan.name
      });
      
      const data = await response.json();
      
      if (isQrPayment) {
        setQrClientSecret(data.clientSecret);
      } else {
        setClientSecret(data.clientSecret);
      }
    } catch (error) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถเริ่มต้นการชำระเงินได้",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (paymentType === 'card' && !clientSecret) {
      createPaymentIntent(false);
    } else if (paymentType === 'qr' && !qrClientSecret) {
      createPaymentIntent(true);
    }
  }, [paymentType, selectedPlan]);

  const activeClientSecret = paymentType === 'qr' ? qrClientSecret : clientSecret;

  return (
    <div className="min-h-screen bg-bg-soft">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
          <button 
            onClick={() => window.history.back()}
            className="p-2 text-gray-500 hover:text-primary transition-colors"
          >
            <i className="fas fa-arrow-left"></i>
          </button>
          <h1 className="text-lg font-semibold text-primary font-kanit">
            สมัครสมาชิก Premium
          </h1>
          <div className="w-8"></div>
        </div>
      </header>

      <main className="max-w-md mx-auto pb-20 p-4">
        {/* Plan Selection */}
        <section className="mb-6">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-center font-kanit">เลือกแผนสมาชิก</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs value={selectedPlan} onValueChange={(value) => setSelectedPlan(value as 'monthly' | 'yearly')}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="monthly" className="font-kanit">รายเดือน</TabsTrigger>
                  <TabsTrigger value="yearly" className="font-kanit">รายปี</TabsTrigger>
                </TabsList>
                
                <TabsContent value="monthly" className="mt-4">
                  <div className="text-center">
                    <h3 className="text-xl font-semibold font-kanit">{plans.monthly.name}</h3>
                    <div className="text-3xl font-bold text-primary mt-2">
                      ฿{plans.monthly.price}
                      <span className="text-sm text-gray-500 font-normal">/เดือน</span>
                    </div>
                    <p className="text-gray-600 mt-2 font-sarabun">{plans.monthly.description}</p>
                  </div>
                </TabsContent>
                
                <TabsContent value="yearly" className="mt-4">
                  <div className="text-center">
                    <h3 className="text-xl font-semibold font-kanit">{plans.yearly.name}</h3>
                    <div className="text-3xl font-bold text-primary mt-2">
                      ฿{plans.yearly.price}
                      <span className="text-sm text-gray-500 font-normal">/ปี</span>
                    </div>
                    {plans.yearly.originalPrice && (
                      <div className="text-sm text-gray-500 line-through">
                        ราคาปกติ ฿{plans.yearly.originalPrice}
                      </div>
                    )}
                    <Badge variant="secondary" className="mt-2">ประหยัด 17%</Badge>
                    <p className="text-gray-600 mt-2 font-sarabun">{plans.yearly.description}</p>
                  </div>
                </TabsContent>
              </Tabs>

              {/* Features List */}
              <div className="mt-6">
                <h4 className="font-medium mb-3 font-kanit">ฟีเจอร์ที่รวมอยู่:</h4>
                <ul className="space-y-2">
                  {currentPlan.features.map((feature, index) => (
                    <li key={index} className="flex items-center text-sm font-sarabun">
                      <i className="fas fa-check text-secondary mr-3"></i>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Payment Method Selection */}
        <section className="mb-6">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="font-kanit">วิธีการชำระเงิน</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant={paymentType === 'card' ? 'default' : 'outline'}
                  onClick={() => setPaymentType('card')}
                  className="h-auto py-4 flex flex-col items-center"
                >
                  <i className="fas fa-credit-card text-xl mb-2"></i>
                  <span className="font-kanit">บัตรเครดิต</span>
                </Button>
                <Button
                  variant={paymentType === 'qr' ? 'default' : 'outline'}
                  onClick={() => setPaymentType('qr')}
                  className="h-auto py-4 flex flex-col items-center"
                >
                  <i className="fas fa-qrcode text-xl mb-2"></i>
                  <span className="font-kanit">QR Code</span>
                  <span className="text-xs">PromptPay</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Payment Form */}
        <section className="mb-6">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="font-kanit">
                {paymentType === 'qr' ? 'ชำระเงินด้วย QR Code' : 'ชำระเงินด้วยบัตรเครดิต'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {paymentType === 'qr' && (
                <Alert className="mb-4">
                  <i className="fas fa-info-circle"></i>
                  <AlertDescription className="font-sarabun">
                    สแกน QR Code ด้วยแอปธนาคารหรือ PromptPay ของคุณเพื่อชำระเงิน
                  </AlertDescription>
                </Alert>
              )}

              {loading ? (
                <div className="text-center py-8">
                  <div className="w-8 h-8 bg-primary/20 rounded-full animate-pulse mx-auto mb-3"></div>
                  <p className="text-gray-500 font-sarabun">กำลังเตรียมการชำระเงิน...</p>
                </div>
              ) : activeClientSecret ? (
                <Elements 
                  stripe={stripePromise} 
                  options={{ 
                    clientSecret: activeClientSecret,
                    appearance: {
                      theme: 'stripe',
                      variables: {
                        colorPrimary: '#1e88e5',
                      }
                    }
                  }}
                >
                  <PaymentForm 
                    paymentType={paymentType}
                    amount={currentPlan.price}
                    productName={currentPlan.name}
                  />
                </Elements>
              ) : (
                <div className="text-center py-8">
                  <i className="fas fa-exclamation-triangle text-amber-500 text-2xl mb-3"></i>
                  <p className="text-gray-500 font-sarabun">ไม่สามารถโหลดข้อมูลการชำระเงินได้</p>
                  <Button 
                    onClick={() => createPaymentIntent(paymentType === 'qr')}
                    variant="outline"
                    className="mt-3"
                  >
                    ลองใหม่
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </section>

        {/* Security Notice */}
        <section className="mb-6">
          <Card className="shadow-sm bg-support/20 border-support/30">
            <CardContent className="pt-6">
              <div className="flex items-start space-x-3">
                <i className="fas fa-shield-alt text-secondary text-lg mt-1"></i>
                <div>
                  <h4 className="font-medium font-kanit mb-1">การชำระเงินปลอดภัย</h4>
                  <p className="text-sm text-gray-600 font-sarabun">
                    การชำระเงินของคุณได้รับการปกป้องด้วย Stripe และไม่มีการเก็บข้อมูลบัตรเครดิตไว้ในระบบของเรา
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>

      <BottomNavigation currentTab="" />
    </div>
  );
}