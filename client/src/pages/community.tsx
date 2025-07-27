import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import BottomNavigation from "@/components/BottomNavigation";
import type { CommunityPost } from "@shared/schema";

export default function Community() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newPost, setNewPost] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [ws, setWs] = useState<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: posts = [], isLoading } = useQuery<CommunityPost[]>({
    queryKey: ["/api/community/posts"],
    enabled: !!user,
  });

  // WebSocket connection for real-time chat
  useEffect(() => {
    if (!user) return;

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    const socket = new WebSocket(wsUrl);

    socket.onopen = () => {
      console.log('Connected to community chat');
      setWs(socket);
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'new_post') {
          queryClient.invalidateQueries({ queryKey: ["/api/community/posts"] });
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    socket.onclose = () => {
      console.log('Disconnected from community chat');
      setWs(null);
    };

    return () => {
      socket.close();
    };
  }, [user, queryClient]);

  const createPostMutation = useMutation({
    mutationFn: async (postData: { content: string; isAnonymous: boolean }) => {
      const response = await apiRequest("POST", "/api/community/posts", postData);
      return response.json();
    },
    onSuccess: (newPost) => {
      queryClient.invalidateQueries({ queryKey: ["/api/community/posts"] });
      setNewPost('');
      
      // Send real-time notification
      if (ws) {
        ws.send(JSON.stringify({
          type: 'new_post',
          post: newPost
        }));
      }
      
      toast({
        title: "โพสต์สำเร็จ",
        description: "ข้อความของคุณถูกแบ่งปันแล้ว",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถโพสต์ข้อความได้",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPost.trim()) return;
    
    createPostMutation.mutate({
      content: newPost.trim(),
      isAnonymous
    });
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [posts]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-soft">
        <div className="animate-pulse text-center">
          <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4"></div>
          <p className="text-gray-500 font-sarabun">กำลังโหลด...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-soft">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-md mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-semibold text-primary font-kanit">
              ชุมชนผู้ร่วมทาง
            </h1>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-secondary rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-600 font-sarabun">ออนไลน์</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto pb-32">
        {/* Community Guidelines */}
        <div className="p-4">
          <Card className="bg-gradient-to-br from-support to-white border-none shadow-sm mb-4">
            <CardContent className="p-4">
              <div className="flex items-center mb-2">
                <i className="fas fa-shield-alt text-primary mr-2"></i>
                <h3 className="font-semibold font-kanit">แนวทางชุมชน</h3>
              </div>
              <p className="text-sm text-gray-600 font-sarabun">
                เราให้ความสำคัญกับความปลอดภัยและการสนับสนุนซึ่งกันและกัน โปรดใช้ภาษาที่สร้างสรรค์และให้กำลังใจ
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Messages */}
        <div className="px-4 space-y-4 mb-4">
          {posts.length === 0 ? (
            <Card className="shadow-sm">
              <CardContent className="p-8 text-center">
                <i className="fas fa-comments text-4xl text-gray-300 mb-4"></i>
                <p className="text-gray-500 font-sarabun mb-4">ยังไม่มีข้อความในชุมชน</p>
                <p className="text-sm text-gray-400 font-sarabun">เป็นคนแรกที่แบ่งปันประสบการณ์ของคุณ</p>
              </CardContent>
            </Card>
          ) : (
            posts.map((post, index) => (
              <Card key={post.id} className="shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                      index % 3 === 0 
                        ? 'bg-gradient-to-br from-primary to-secondary'
                        : index % 3 === 1
                        ? 'bg-gradient-to-br from-accent to-yellow-500'
                        : 'bg-gradient-to-br from-secondary to-green-600'
                    }`}>
                      <span className="text-white text-sm font-medium">
                        {post.isAnonymous ? 'A' : 'U'}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="bg-gray-50 rounded-card p-3 mb-2">
                        <p className="text-sm leading-relaxed font-sarabun">
                          {post.content}
                        </p>
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span className="font-sarabun">
                          {post.isAnonymous ? 'ผู้ใช้ไม่ระบุชื่อ' : 'ผู้ใช้'}
                        </span>
                        <span className="font-sarabun">
                          {new Date(post.createdAt || new Date()).toLocaleString('th-TH')}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Message Input (Fixed at bottom) */}
      <div className="fixed bottom-16 left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
        <div className="max-w-md mx-auto p-4">
          <form onSubmit={handleSubmit} className="space-y-3">
            <Textarea
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              placeholder="แบ่งปันความรู้สึกหรือให้กำลังใจเพื่อน..."
              className="min-h-[80px] resize-none font-sarabun"
              maxLength={500}
            />
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Switch
                  id="anonymous"
                  checked={isAnonymous}
                  onCheckedChange={setIsAnonymous}
                />
                <Label htmlFor="anonymous" className="text-sm font-sarabun">
                  ไม่ระบุชื่อ
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-500 font-sarabun">
                  {newPost.length}/500
                </span>
                <Button
                  type="submit"
                  disabled={!newPost.trim() || createPostMutation.isPending}
                  className="bg-primary hover:bg-blue-600 text-white font-kanit"
                >
                  {createPostMutation.isPending ? (
                    <i className="fas fa-spinner fa-spin"></i>
                  ) : (
                    <>
                      <i className="fas fa-paper-plane mr-2"></i>
                      ส่ง
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>

      <BottomNavigation currentTab="community" />
    </div>
  );
}
