import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { bookingAPI, messageAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import type { Booking, Message, Conversation } from '../types';
import { format } from 'date-fns';
import { ArrowLeft, Send, Phone, Video, User } from 'lucide-react';

const Messages: React.FC = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (bookingId) {
      fetchBookingMessages(bookingId);
    }
  }, [bookingId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchConversations = async () => {
    try {
      const response = await messageAPI.getConversations();
      setConversations(response.data.data);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchBookingMessages = async (id: string) => {
    try {
      const [bookingRes, messagesRes] = await Promise.all([
        bookingAPI.getBookingById(id),
        bookingAPI.getMessages(id)
      ]);
      setSelectedBooking(bookingRes.data.data);
      setMessages(messagesRes.data.data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !bookingId) return;

    try {
      await bookingAPI.sendMessage(bookingId, newMessage);
      setNewMessage('');
      fetchBookingMessages(bookingId);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const getOtherPerson = (booking: Booking) => {
    if (typeof booking.userId === 'object' && typeof booking.friendId === 'object') {
      return booking.userId._id === user?.id ? booking.friendId : booking.userId;
    }
    return null;
  };

  // Show conversation list if no booking selected
  if (!bookingId) {
    return (
      <div className="min-h-screen bg-muted/30 py-8">
        <div className="container mx-auto px-4 max-w-2xl">
          <h1 className="text-3xl font-bold mb-8">Messages</h1>
          
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : conversations.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">No conversations yet</p>
                <Link to="/bookings">
                  <Button className="mt-4">View Bookings</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {conversations.map((conv) => (
                <Link key={conv.bookingId} to={`/messages/${conv.bookingId}`}>
                  <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                          {conv.otherPerson.avatar ? (
                            <img 
                              src={conv.otherPerson.avatar} 
                              alt="" 
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            <User className="h-6 w-6 text-primary" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold">
                              {conv.otherPerson.firstName} {conv.otherPerson.lastName}
                            </h3>
                            {conv.unreadCount > 0 && (
                              <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
                                {conv.unreadCount}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground truncate">
                            {conv.lastMessage?.content || 'No messages yet'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {conv.lastMessage && format(new Date(conv.lastMessage.timestamp), 'MMM d, h:mm a')}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Show chat interface
  const otherPerson = selectedBooking ? getOtherPerson(selectedBooking) : null;

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container mx-auto px-4 max-w-4xl h-screen flex flex-col py-4">
        {/* Header */}
        <Card className="mb-4">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link to="/messages">
                  <Button variant="ghost" size="sm">
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                </Link>
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  {otherPerson?.avatar ? (
                    <img 
                      src={otherPerson.avatar} 
                      alt="" 
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <User className="h-5 w-5 text-primary" />
                  )}
                </div>
                <div>
                  <h2 className="font-semibold">
                    {otherPerson?.firstName} {otherPerson?.lastName}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {selectedBooking?.situation.category} Booking
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm">
                  <Phone className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Video className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Messages */}
        <Card className="flex-1 overflow-hidden">
          <CardContent className="p-4 h-full flex flex-col">
            <div className="flex-1 overflow-y-auto space-y-4">
              {messages.map((message, index) => {
                const isMe = message.senderId === user?.id;
                return (
                  <div
                    key={index}
                    className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] px-4 py-2 rounded-lg ${
                        isMe
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      <p>{message.content}</p>
                      <p className={`text-xs mt-1 ${isMe ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                        {format(new Date(message.timestamp), 'h:mm a')}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={sendMessage} className="mt-4 flex gap-2">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1"
              />
              <Button type="submit" disabled={!newMessage.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Messages;
