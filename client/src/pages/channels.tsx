import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import BottomNavigation from "@/components/BottomNavigation";
import type { DiscussionChannel, ChannelMessage } from "@shared/schema";

export default function Channels() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [showCreateChannel, setShowCreateChannel] = useState(false);
  const [newChannelData, setNewChannelData] = useState({
    name: '',
    description: '',
    category: 'support'
  });

  const { data: channels = [], isLoading: channelsLoading } = useQuery<DiscussionChannel[]>({
    queryKey: ["/api/channels"],
    enabled: !!user,
  });

  const { data: messages = [], isLoading: messagesLoading } = useQuery<ChannelMessage[]>({
    queryKey: ["/api/channels", selectedChannel, "messages"],
    enabled: !!user && !!selectedChannel,
  });

  const createChannelMutation = useMutation({
    mutationFn: async (channelData: typeof newChannelData) => {
      const response = await apiRequest("POST", "/api/channels", channelData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/channels"] });
      setShowCreateChannel(false);
      setNewChannelData({ name: '', description: '', category: 'support' });
      toast({
        title: "สร้างช่องสนทนาสำเร็จ!",
        description: "ช่องสนทนาใหม่ถูกสร้างแล้ว",
      });
    },
    onError: () => {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถสร้างช่องสนทนาได้",
        variant: "destructive",
      });
    }
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (messageData: { content: string; channelId: string }) => {
      const response = await apiRequest("POST", `/api/channels/${messageData.channelId}/messages`, {
        content: messageData.content
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/channels", selectedChannel, "messages"] });
      setNewMessage('');
    },
    onError: () => {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถส่งข้อความได้",
        variant: "destructive",
      });
    }
  });

  const handleCreateChannel = () => {
    if (!newChannelData.name.trim()) return;
    createChannelMutation.mutate(newChannelData);
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedChannel) return;
    sendMessageMutation.mutate({
      content: newMessage,
      channelId: selectedChannel
    });
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'support': return 'bg-blue-100 text-blue-800';
      case 'recovery_stories': return 'bg-green-100 text-green-800';
      case 'daily_check_in': return 'bg-yellow-100 text-yellow-800';
      case 'resources': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'support': return 'การสนับสนุน';
      case 'recovery_stories': return 'เรื่องราวการฟื้นฟู';
      case 'daily_check_in': return 'เช็คอินรายวัน';
      case 'resources': return 'แหล่งข้อมูล';
      default: return category;
    }
  };

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
          <h1 className="text-2xl font-bold text-gray-800 font-kanit">ช่องสนทนา</h1>
          <p className="text-gray-600 font-sarabun">เข้าร่วมชุมชนและแบ่งปันประสบการณ์</p>
        </header>

        <Tabs defaultValue="channels" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="channels" className="font-sarabun">รายการช่อง</TabsTrigger>
            <TabsTrigger value="chat" className="font-sarabun">แชท</TabsTrigger>
          </TabsList>

          <TabsContent value="channels" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold font-kanit">ช่องสนทนาทั้งหมด</h2>
              <Dialog open={showCreateChannel} onOpenChange={setShowCreateChannel}>
                <DialogTrigger asChild>
                  <Button size="sm" className="font-sarabun">
                    <i className="fas fa-plus mr-2"></i>
                    สร้างช่องใหม่
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle className="font-kanit">สร้างช่องสนทนาใหม่</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium font-sarabun">ชื่อช่อง</label>
                      <Input
                        value={newChannelData.name}
                        onChange={(e) => setNewChannelData({...newChannelData, name: e.target.value})}
                        placeholder="ชื่อช่องสนทนา"
                        className="font-sarabun"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium font-sarabun">คำอธิบาย</label>
                      <Textarea
                        value={newChannelData.description}
                        onChange={(e) => setNewChannelData({...newChannelData, description: e.target.value})}
                        placeholder="อธิบายเกี่ยวกับช่องนี้"
                        className="font-sarabun"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium font-sarabun">หมวดหมู่</label>
                      <Select
                        value={newChannelData.category}
                        onValueChange={(value) => setNewChannelData({...newChannelData, category: value})}
                      >
                        <SelectTrigger className="font-sarabun">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="support">การสนับสนุน</SelectItem>
                          <SelectItem value="recovery_stories">เรื่องราวการฟื้นฟู</SelectItem>
                          <SelectItem value="daily_check_in">เช็คอินรายวัน</SelectItem>
                          <SelectItem value="resources">แหล่งข้อมูล</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button
                      onClick={handleCreateChannel}
                      disabled={createChannelMutation.isPending}
                      className="w-full font-sarabun"
                    >
                      {createChannelMutation.isPending ? "กำลังสร้าง..." : "สร้างช่อง"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {channelsLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-20 bg-white/50 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {channels.map((channel) => (
                  <Card
                    key={channel.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      selectedChannel === channel.id ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => setSelectedChannel(channel.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold font-kanit">{channel.name}</h3>
                          <p className="text-sm text-gray-600 font-sarabun mt-1">
                            {channel.description}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge className={getCategoryColor(channel.category)}>
                              {getCategoryLabel(channel.category)}
                            </Badge>
                            <span className="text-xs text-gray-500 font-sarabun">
                              {channel.memberCount} สมาชิก
                            </span>
                          </div>
                        </div>
                        <i className="fas fa-chevron-right text-gray-400"></i>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="chat" className="space-y-4">
            {selectedChannel ? (
              <div className="space-y-4">
                <div className="bg-white rounded-lg border h-96 flex flex-col">
                  <div className="border-b p-3">
                    <h3 className="font-semibold font-kanit">
                      {channels.find(c => c.id === selectedChannel)?.name}
                    </h3>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto p-3 space-y-3">
                    {messagesLoading ? (
                      <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                      </div>
                    ) : (
                      messages.map((message) => (
                        <div key={message.id} className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium font-sarabun">
                              {message.isAnonymous ? 'ผู้ใช้ไม่ระบุนาม' : 'สมาชิก'}
                            </span>
                            <span className="text-xs text-gray-500 font-sarabun">
                              {message.createdAt ? new Date(message.createdAt).toLocaleTimeString('th-TH') : ''}
                            </span>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-2">
                            <p className="text-sm font-sarabun">{message.content}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  
                  <div className="border-t p-3">
                    <div className="flex gap-2">
                      <Input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="พิมพ์ข้อความ..."
                        className="flex-1 font-sarabun"
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      />
                      <Button
                        onClick={handleSendMessage}
                        disabled={sendMessageMutation.isPending || !newMessage.trim()}
                        size="sm"
                      >
                        <i className="fas fa-paper-plane"></i>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <i className="fas fa-comments text-4xl text-gray-400 mb-4"></i>
                <p className="text-gray-600 font-sarabun">เลือกช่องสนทนาเพื่อเริ่มแชท</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <BottomNavigation currentTab="channels" />
    </div>
  );
}