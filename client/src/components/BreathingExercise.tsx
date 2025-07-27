import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface BreathingExerciseProps {
  isOpen: boolean;
  onClose: () => void;
}

type BreathingPhase = 'inhale' | 'hold' | 'exhale' | 'pause';

export default function BreathingExercise({ isOpen, onClose }: BreathingExerciseProps) {
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState<BreathingPhase>('inhale');
  const [countdown, setCountdown] = useState(4);
  const [cycle, setCycle] = useState(0);

  const phaseConfig = {
    inhale: { duration: 4, next: 'hold' as BreathingPhase, text: 'หายใจเข้า', color: 'from-primary to-blue-600' },
    hold: { duration: 7, next: 'exhale' as BreathingPhase, text: 'กลั้นหายใจ', color: 'from-accent to-yellow-500' },
    exhale: { duration: 8, next: 'pause' as BreathingPhase, text: 'หายใจออก', color: 'from-secondary to-green-600' },
    pause: { duration: 1, next: 'inhale' as BreathingPhase, text: 'พักผ่อน', color: 'from-gray-400 to-gray-500' },
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isActive && isOpen) {
      interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            const currentConfig = phaseConfig[phase];
            setPhase(currentConfig.next);
            
            if (phase === 'pause') {
              setCycle(c => c + 1);
            }
            
            return phaseConfig[currentConfig.next].duration;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isActive, isOpen, phase]);

  useEffect(() => {
    if (!isOpen) {
      setIsActive(false);
      setPhase('inhale');
      setCountdown(4);
      setCycle(0);
    }
  }, [isOpen]);

  const startExercise = () => {
    setIsActive(true);
    setPhase('inhale');
    setCountdown(4);
    setCycle(0);
  };

  const stopExercise = () => {
    setIsActive(false);
    setPhase('inhale');
    setCountdown(4);
  };

  const currentConfig = phaseConfig[phase];
  const progress = ((currentConfig.duration - countdown) / currentConfig.duration) * 100;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm mx-auto p-8 rounded-card bg-gradient-to-br from-primary/5 to-blue-50">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2 font-kanit">การหายใจผ่อนคลาย</h2>
          <p className="text-gray-600 text-sm mb-8 font-sarabun">ตามจังหวะการหายใจเพื่อผ่อนคลาย</p>
          
          {/* Breathing animation circle */}
          <div className="relative w-32 h-32 mx-auto mb-8">
            <div className="absolute inset-0 bg-gray-200 rounded-full opacity-20"></div>
            <div 
              className={`absolute inset-0 bg-gradient-to-br ${currentConfig.color} rounded-full flex items-center justify-center transition-all duration-1000 ${
                isActive && (phase === 'inhale' || phase === 'hold') ? 'scale-110' : 'scale-100'
              } ${isActive ? 'animate-breathing' : ''}`}
            >
              <div className="text-center text-white">
                <div className="text-lg font-semibold font-kanit">{currentConfig.text}</div>
                <div className="text-2xl font-bold">{countdown}</div>
              </div>
            </div>
          </div>
          
          {/* Progress indicator */}
          <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-1000"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          
          {/* Cycle counter */}
          {isActive && (
            <p className="text-sm text-gray-600 mb-6 font-sarabun">
              รอบที่ {cycle + 1} • ทำต่อเนื่อง 5-10 รอบ
            </p>
          )}
          
          <div className="space-y-3">
            {!isActive ? (
              <Button 
                onClick={startExercise}
                className="w-full bg-primary text-white py-3 rounded-card font-medium hover:bg-blue-600 transition-colors font-kanit"
              >
                เริ่มฝึกหายใจ
              </Button>
            ) : (
              <Button 
                onClick={stopExercise}
                className="w-full bg-red-500 text-white py-3 rounded-card font-medium hover:bg-red-600 transition-colors font-kanit"
              >
                หยุดฝึก
              </Button>
            )}
            
            <Button 
              onClick={onClose}
              className="w-full bg-gray-100 text-gray-600 py-3 rounded-card font-medium hover:bg-gray-200 transition-colors font-kanit"
              variant="ghost"
            >
              ปิด
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
