import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";

interface BottomNavigationProps {
  currentTab: string;
}

export default function BottomNavigation({ currentTab }: BottomNavigationProps) {
  const [, setLocation] = useLocation();

  const tabs = [
    { id: 'home', name: 'หน้าหลัก', icon: 'fas fa-home', path: '/' },
    { id: 'progress', name: 'ความก้าวหน้า', icon: 'fas fa-chart-line', path: '/progress' },
    { id: 'goals', name: 'เป้าหมาย', icon: 'fas fa-bullseye', path: '/goals' },
    { id: 'analytics', name: 'วิเคราะห์', icon: 'fas fa-brain', path: '/analytics' },
    { id: 'community', name: 'ชุมชน', icon: 'fas fa-users', path: '/community' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-30">
      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-around py-2">
          {tabs.map((tab) => (
            <Button
              key={tab.id}
              onClick={() => setLocation(tab.path)}
              variant="ghost"
              className={`flex flex-col items-center py-2 px-3 h-auto ${
                currentTab === tab.id 
                  ? 'text-primary' 
                  : 'text-gray-400 hover:text-primary'
              } transition-colors`}
            >
              <i className={`${tab.icon} text-lg mb-1`}></i>
              <span className="text-xs font-medium font-kanit">{tab.name}</span>
            </Button>
          ))}
        </div>
      </div>
    </nav>
  );
}
