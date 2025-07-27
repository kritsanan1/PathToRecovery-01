import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-support to-white">
      <div className="max-w-md mx-auto px-4 py-8">
        {/* Logo and Title */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center mx-auto mb-6">
            <i className="fas fa-heart text-white text-3xl"></i>
          </div>
          <h1 className="text-3xl font-bold text-primary mb-4 font-kanit">RecoveryPath</h1>
          <p className="text-xl text-text-dark font-sarabun">เส้นทางสู่การฟื้นฟู</p>
        </div>

        {/* Features */}
        <div className="space-y-6 mb-12">
          <Card className="bg-white/70 backdrop-blur-sm border-none shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 bg-primary/20 rounded-card flex items-center justify-center">
                  <i className="fas fa-chart-line text-primary text-xl"></i>
                </div>
                <div>
                  <h3 className="font-semibold text-lg font-kanit">ติดตามความก้าวหน้า</h3>
                  <p className="text-sm text-gray-600 font-sarabun">บันทึกและติดตามการฟื้นฟูของคุณ</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-none shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 bg-secondary/20 rounded-card flex items-center justify-center">
                  <i className="fas fa-users text-secondary text-xl"></i>
                </div>
                <div>
                  <h3 className="font-semibold text-lg font-kanit">ชุมชนสนับสนุน</h3>
                  <p className="text-sm text-gray-600 font-sarabun">เชื่อมต่อกับผู้ที่ร่วมเดินทาง</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-none shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 bg-accent/20 rounded-card flex items-center justify-center">
                  <i className="fas fa-book-open text-accent text-xl"></i>
                </div>
                <div>
                  <h3 className="font-semibold text-lg font-kanit">แหล่งความรู้</h3>
                  <p className="text-sm text-gray-600 font-sarabun">เรียนรู้เทคนิคการฟื้นฟู</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-none shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-card flex items-center justify-center">
                  <i className="fas fa-shield-alt text-red-600 text-xl"></i>
                </div>
                <div>
                  <h3 className="font-semibold text-lg font-kanit">ความช่วยเหลือฉุกเฉิน</h3>
                  <p className="text-sm text-gray-600 font-sarabun">เข้าถึงความช่วยเหลือได้ทันที</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Login Button */}
        <div className="text-center">
          <Button 
            onClick={handleLogin}
            className="w-full bg-primary hover:bg-blue-600 text-white py-4 text-lg font-semibold font-kanit rounded-card shadow-lg"
          >
            เริ่มต้นการฟื้นฟู
          </Button>
          <p className="text-sm text-gray-500 mt-4 font-sarabun">
            การเข้าสู่ระบบจะใช้บัญชี Replit ของคุณ
          </p>
        </div>
      </div>
    </div>
  );
}
