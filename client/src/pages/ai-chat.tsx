import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import BottomNavigation from "@/components/BottomNavigation";
import type { ChatbotConversation, ChatbotMessage } from "@shared/schema";

export default function AIChat() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: conversations = [], isLoading: conversationsLoading } = useQuery<ChatbotConversation[]>({
    queryKey: ["/api/chatbot/conversations"],
    enabled: !!user,
  });

  const { data: messages = [], isLoading: messagesLoading } = useQuery<ChatbotMessage[]>({
    queryKey: ["/api/chatbot/conversations", selectedConversation, "messages"],
    enabled: !!user && !!selectedConversation,
  });

  const createConversationMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/chatbot/conversations", {
        title: "การสนทนาใหม่"
      });
      return response.json();
    },
    onSuccess: (conversation) => {
      queryClient.invalidateQueries({ queryKey: ["/api/chatbot/conversations"] });
      setSelectedConversation(conversation.id);
      toast({
        title: "เริ่มการสนทนาใหม่",
        description: "พร้อมสำหรับการสนทนากับ AI แล้ว",
      });
    }
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      const response = await apiRequest("POST", `/api/chatbot/conversations/${selectedConversation}/messages`, {
        content
      });
      return response.json();
    },
    onMutate: () => {
      setIsTyping(true);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ["/api/chatbot/conversations", selectedConversation, "messages"] 
      });
      setNewMessage('');
      setIsTyping(false);
    },
    onError: () => {
      setIsTyping(false);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถส่งข้อความได้",
        variant: "destructive",
      });
    }
  });

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedConversation) return;
    sendMessageMutation.mutate(newMessage);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Auto-select first conversation or create new one
  useEffect(() => {
    if (conversations.length > 0 && !selectedConversation) {
      setSelectedConversation(conversations[0].id);
    }
  }, [conversations, selectedConversation]);

  const getMoodColor = (mood?: string) => {
    switch (mood) {
      case 'positive': return 'bg-green-100 text-green-800';
      case 'neutral': return 'bg-yellow-100 text-yellow-800';
      case 'negative': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCrisisLevel = (level?: string) => {
    switch (level) {
      case 'high': return '⚠️ ระดับสูง';
      case 'medium': return '⚡ ระดับกลาง';
      case 'low': return '✅ ระดับต่ำ';
      default: return '';
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
          <h1 className="text-2xl font-bold text-gray-800 font-kanit">AI ที่ปรึกษา</h1>
          <p className="text-gray-600 font-sarabun">สนทนากับ AI เพื่อขอคำแนะนำและการสนับสนุน</p>
        </header>

        <div className="space-y-4">
          {/* Conversation Selector */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg font-kanit">การสนทนา</CardTitle>
                <Button
                  onClick={() => createConversationMutation.mutate()}
                  disabled={createConversationMutation.isPending}
                  size="sm"
                  className="font-sarabun"
                >
                  <i className="fas fa-plus mr-2"></i>
                  ใหม่
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-24">
                <div className="space-y-2">
                  {conversationsLoading ? (
                    <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
                  ) : conversations.length === 0 ? (
                    <p className="text-sm text-gray-500 font-sarabun text-center py-2">
                      ยังไม่มีการสนทนา
                    </p>
                  ) : (
                    conversations.map((conversation) => (
                      <div
                        key={conversation.id}
                        className={`p-2 rounded cursor-pointer transition-colors ${
                          selectedConversation === conversation.id
                            ? 'bg-primary text-white'
                            : 'bg-gray-100 hover:bg-gray-200'
                        }`}
                        onClick={() => setSelectedConversation(conversation.id)}
                      >
                        <p className="text-sm font-sarabun truncate">
                          {conversation.title || "การสนทนา"}
                        </p>
                        <p className="text-xs opacity-75 font-sarabun">
                          {new Date(conversation.updatedAt).toLocaleDateString('th-TH')}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Chat Interface */}
          {selectedConversation ? (
            <Card>
              <CardContent className="p-0">
                <ScrollArea className="h-96 p-4">
                  <div className="space-y-4">
                    {messagesLoading ? (
                      <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                      </div>
                    ) : messages.length === 0 ? (
                      <div className="text-center py-8">
                        <i className="fas fa-robot text-4xl text-gray-400 mb-4"></i>
                        <p className="text-gray-600 font-sarabun">เริ่มสนทนากับ AI ที่ปรึกษา</p>
                        <p className="text-sm text-gray-500 font-sarabun mt-2">
                          พิมพ์ข้อความด้านล่างเพื่อเริ่มต้น
                        </p>
                      </div>
                    ) : (
                      messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[80%] p-3 rounded-lg ${
                              message.role === 'user'
                                ? 'bg-primary text-white'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <i className={`fas ${message.role === 'user' ? 'fa-user' : 'fa-robot'} text-sm`}></i>
                              <span className="text-xs font-sarabun opacity-75">
                                {message.role === 'user' ? 'คุณ' : 'AI ที่ปรึกษา'}
                              </span>
                            </div>
                            <p className="text-sm font-sarabun leading-relaxed">
                              {message.content}
                            </p>
                            
                            {/* Display AI metadata */}
                            {message.role === 'assistant' && message.metadata && (
                              <div className="mt-2 space-y-1">
                                {message.metadata.mood_detected && (
                                  <Badge className={getMoodColor(message.metadata.mood_detected)}>
                                    อารมณ์: {message.metadata.mood_detected}
                                  </Badge>
                                )}
                                {message.metadata.crisis_level && (
                                  <Badge variant="outline" className="text-xs">
                                    {getCrisisLevel(message.metadata.crisis_level)}
                                  </Badge>
                                )}
                              </div>
                            )}
                            
                            <p className="text-xs opacity-50 mt-1 font-sarabun">
                              {new Date(message.createdAt).toLocaleTimeString('th-TH')}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                    
                    {/* Typing indicator */}
                    {isTyping && (
                      <div className="flex justify-start">
                        <div className="bg-gray-100 p-3 rounded-lg">
                          <div className="flex items-center gap-2">
                            <i className="fas fa-robot text-sm"></i>
                            <span className="text-xs font-sarabun">AI กำลังพิมพ์</span>
                            <div className="flex space-x-1">
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>
                
                {/* Message Input */}
                <div className="border-t p-4">
                  <div className="flex gap-2">
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="พิมพ์ข้อความของคุณ..."
                      className="flex-1 font-sarabun"
                      onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                      disabled={sendMessageMutation.isPending}
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={sendMessageMutation.isPending || !newMessage.trim()}
                      size="sm"
                    >
                      <i className="fas fa-paper-plane"></i>
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 font-sarabun mt-2 text-center">
                    AI ที่ปรึกษาพร้อมให้คำแนะนำและการสนับสนุนตลอด 24 ชั่วโมง
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <i className="fas fa-robot text-4xl text-gray-400 mb-4"></i>
                <p className="text-gray-600 font-sarabun">เลือกการสนทนาหรือสร้างใหม่</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <BottomNavigation currentTab="ai-chat" />
    </div>
  );
}