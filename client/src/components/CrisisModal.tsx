import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface CrisisModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CrisisModal({ isOpen, onClose }: CrisisModalProps) {
  const handleCall = (phoneNumber: string) => {
    window.location.href = `tel:${phoneNumber}`;
  };

  const handleAnonymousChat = () => {
    // Implement anonymous chat functionality
    console.log("Starting anonymous chat...");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm mx-auto p-6 rounded-card">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-heart text-white text-2xl"></i>
          </div>
          <h2 className="text-xl font-semibold mb-2 font-kanit">คุณไม่ได้อยู่คนเดียว</h2>
          <p className="text-gray-600 text-sm font-sarabun">เรามีการสนับสนุนและความช่วยเหลือให้คุณ</p>
        </div>
        
        <div className="space-y-3 mb-6">
          {/* Emergency helpline */}
          <Button
            onClick={() => handleCall("1413")}
            className="w-full flex items-center space-x-3 p-4 bg-red-50 border border-red-200 rounded-card hover:bg-red-100 transition-colors h-auto text-left"
            variant="ghost"
          >
            <i className="fas fa-phone text-red-600 text-xl"></i>
            <div>
              <p className="font-semibold text-red-600 font-kanit">โทรหาความช่วยเหลือฉุกเฉิน</p>
              <p className="text-sm text-red-500 font-sarabun">1413 - สายด่วนสุขภาพจิต</p>
            </div>
          </Button>
          
          {/* Breathing exercise */}
          <Button
            onClick={onClose}
            className="w-full flex items-center space-x-3 p-4 bg-primary/10 border border-primary/20 rounded-card hover:bg-primary/20 transition-colors h-auto text-left"
            variant="ghost"
          >
            <i className="fas fa-lungs text-primary text-xl"></i>
            <div>
              <p className="font-semibold text-primary font-kanit">แบบฝึกหายใจผ่อนคลาย</p>
              <p className="text-sm text-primary/70 font-sarabun">นำทางการหายใจ 4-7-8</p>
            </div>
          </Button>
          
          {/* Anonymous chat */}
          <Button
            onClick={handleAnonymousChat}
            className="w-full flex items-center space-x-3 p-4 bg-secondary/10 border border-secondary/20 rounded-card hover:bg-secondary/20 transition-colors h-auto text-left"
            variant="ghost"
          >
            <i className="fas fa-comments text-secondary text-xl"></i>
            <div>
              <p className="font-semibold text-secondary font-kanit">พูดคุยกับผู้เชี่ยวชาญ</p>
              <p className="text-sm text-secondary/70 font-sarabun">แชทแบบไม่ระบุชื่อ - เปิด 24 ชม.</p>
            </div>
          </Button>
        </div>
        
        <Button 
          onClick={onClose}
          className="w-full bg-gray-100 text-gray-600 py-3 rounded-card font-medium hover:bg-gray-200 transition-colors font-kanit"
          variant="ghost"
        >
          ปิด
        </Button>
      </DialogContent>
    </Dialog>
  );
}
