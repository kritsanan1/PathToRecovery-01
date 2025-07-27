import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import BottomNavigation from "@/components/BottomNavigation";
import type { Resource } from "@shared/schema";

export default function Resources() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: resources = [] } = useQuery<Resource[]>({
    queryKey: selectedCategory === 'all' ? ["/api/resources"] : ["/api/resources", { category: selectedCategory }],
  });

  const categories = [
    { id: 'all', name: 'ทั้งหมด', icon: 'fas fa-th-large' },
    { id: 'mental_health', name: 'สุขภาพจิต', icon: 'fas fa-brain' },
    { id: 'strategy', name: 'กลยุทธ์', icon: 'fas fa-chess' },
    { id: 'support', name: 'การสนับสนุน', icon: 'fas fa-hands-helping' },
  ];

  const filteredResources = resources.filter(resource =>
    resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    resource.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-bg-soft">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-md mx-auto px-4 py-3">
          <h1 className="text-lg font-semibold text-primary font-kanit text-center">
            แหล่งความรู้
          </h1>
        </div>
      </header>

      <main className="max-w-md mx-auto pb-20">
        {/* Search */}
        <div className="p-4">
          <Input
            type="text"
            placeholder="ค้นหาความรู้..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full font-sarabun"
          />
        </div>

        {/* Categories */}
        <div className="px-4 mb-6">
          <div className="flex space-x-2 overflow-x-auto pb-2">
            {categories.map((category) => (
              <Button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                variant={selectedCategory === category.id ? "default" : "outline"}
                className={`flex-shrink-0 h-auto py-2 px-4 rounded-card font-kanit text-sm ${
                  selectedCategory === category.id 
                    ? 'bg-primary text-white' 
                    : 'bg-white text-gray-600 border-gray-200'
                }`}
              >
                <i className={`${category.icon} mr-2`}></i>
                {category.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Resources Grid */}
        <div className="px-4 space-y-4">
          {filteredResources.length === 0 ? (
            <Card className="shadow-sm">
              <CardContent className="p-8 text-center">
                <i className="fas fa-search text-4xl text-gray-300 mb-4"></i>
                <p className="text-gray-500 font-sarabun">ไม่พบข้อมูลที่ค้นหา</p>
              </CardContent>
            </Card>
          ) : (
            filteredResources.map((resource) => (
              <Card key={resource.id} className="shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex space-x-4">
                    {resource.imageUrl && (
                      <img 
                        src={resource.imageUrl} 
                        alt={resource.title}
                        className="w-20 h-16 rounded object-cover flex-shrink-0" 
                      />
                    )}
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-2 font-kanit line-clamp-2">
                        {resource.title}
                      </h3>
                      
                      {resource.description && (
                        <p className="text-sm text-gray-600 mb-3 font-sarabun line-clamp-2">
                          {resource.description}
                        </p>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            resource.category === 'mental_health' 
                              ? 'bg-secondary/20 text-secondary'
                              : resource.category === 'strategy'
                              ? 'bg-accent/20 text-accent'
                              : 'bg-primary/20 text-primary'
                          }`}>
                            {resource.category === 'mental_health' ? 'สุขภาพจิต' : 
                             resource.category === 'strategy' ? 'กลยุทธ์' : 'สนับสนุน'}
                          </span>
                          
                          <span className="text-xs text-gray-500 font-sarabun">
                            <i className={`fas ${
                              resource.type === 'video' ? 'fa-play' : 
                              resource.type === 'audio' ? 'fa-headphones' : 'fa-file-text'
                            } mr-1`}></i>
                            {resource.type === 'video' ? 'วิดีโอ' : 
                             resource.type === 'audio' ? 'เสียง' : 'บทความ'}
                          </span>
                        </div>
                        
                        {resource.estimatedTime && (
                          <span className="text-xs text-gray-500 font-sarabun">
                            {resource.estimatedTime} นาที
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex items-center justify-between">
                    <Button 
                      className="flex-1 mr-2 bg-primary hover:bg-blue-600 text-white font-kanit"
                    >
                      <i className="fas fa-external-link-alt mr-2"></i>
                      เปิดดู
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="px-3"
                    >
                      <i className="fas fa-bookmark"></i>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Quick Actions */}
        <div className="px-4 mt-8 mb-6">
          <Card className="bg-gradient-to-br from-support to-white border-none shadow-sm">
            <CardContent className="p-4">
              <h3 className="font-semibold mb-3 font-kanit">เครื่องมือช่วยเหลือ</h3>
              
              <div className="grid grid-cols-2 gap-3">
                <Button className="h-auto py-3 bg-secondary hover:bg-green-600 text-white rounded-card">
                  <div className="text-center">
                    <i className="fas fa-lungs text-lg mb-1 block"></i>
                    <span className="text-sm font-kanit">ฝึกหายใจ</span>
                  </div>
                </Button>
                
                <Button className="h-auto py-3 bg-accent hover:bg-orange-600 text-white rounded-card">
                  <div className="text-center">
                    <i className="fas fa-phone text-lg mb-1 block"></i>
                    <span className="text-sm font-kanit">สายด่วน</span>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <BottomNavigation currentTab="resources" />
    </div>
  );
}
