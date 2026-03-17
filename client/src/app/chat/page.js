'use client';
export const dynamic = "force-dynamic";
import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { chatAPI } from '../../lib/api';

export default function ChatPage() {
    const { user } = useAuth();
    const searchParams = useSearchParams();
    const [conversations, setConversations] = useState([]);
    const [activeChat, setActiveChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMsg, setNewMsg] = useState('');
    const [loading, setLoading] = useState(true);
    const msgEndRef = useRef(null);
    const toUserId = searchParams.get('to');

    useEffect(() => {
        loadConversations();
    }, []);

    useEffect(() => {
        if (toUserId && user) {
            const chatId = [user.id, toUserId].sort().join('_');
            setActiveChat({ chatId, otherUser: { _id: toUserId, name: 'User' } });
            loadMessages(chatId);
        }
    }, [toUserId, user]);

    useEffect(() => {
        msgEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Poll for new messages every 3s
    useEffect(() => {
        if (!activeChat) return;
        const interval = setInterval(() => loadMessages(activeChat.chatId), 3000);
        return () => clearInterval(interval);
    }, [activeChat]);

    const loadConversations = async () => {
        try {
            const data = await chatAPI.getConversations();
            setConversations(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const loadMessages = async (chatId) => {
        try {
            const data = await chatAPI.getMessages(chatId);
            setMessages(data);
        } catch (err) {
            console.error(err);
        }
    };

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!newMsg.trim() || !activeChat) return;

        try {
            const receiverId = activeChat.chatId.split('_').find(id => id !== user.id);
            await chatAPI.sendMessage({ receiverId, content: newMsg });
            setNewMsg('');
            loadMessages(activeChat.chatId);
        } catch (err) {
            console.error(err);
        }
    };

    const selectConversation = (conv) => {
        setActiveChat(conv);
        loadMessages(conv.chatId);
        chatAPI.markAsRead(conv.chatId);
    };

    return (
        <div className="min-h-screen py-8">
            <div className="max-w-6xl mx-auto px-4">
                <h1 className="section-heading mb-6">Messages</h1>

                <div className="glass-card overflow-hidden" style={{ height: 'calc(100vh - 180px)' }}>
                    <div className="flex h-full">
                        {/* Conversation List */}
                        <div className={`w-full md:w-80 border-r border-white/10 flex flex-col ${activeChat ? 'hidden md:flex' : 'flex'}`}>
                            <div className="p-4 border-b border-white/10">
                                <h2 className="font-semibold text-white text-sm">Conversations</h2>
                            </div>
                            <div className="flex-1 overflow-y-auto">
                                {conversations.length === 0 ? (
                                    <div className="text-center py-12 px-4">
                                        <p className="text-4xl mb-3">💬</p>
                                        <p className="text-sm text-dark-400">No conversations yet</p>
                                        <p className="text-xs text-dark-500 mt-1">Start a conversation from an item page</p>
                                    </div>
                                ) : (
                                    conversations.map(conv => (
                                        <button
                                            key={conv.chatId}
                                            onClick={() => selectConversation(conv)}
                                            className={`w-full text-left p-4 flex items-center gap-3 hover:bg-white/5 transition-colors border-b border-white/5 ${activeChat?.chatId === conv.chatId ? 'bg-white/10' : ''
                                                }`}
                                        >
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white text-sm font-bold shrink-0 overflow-hidden">
                                                {conv.otherUser?.profilePhoto ? (
                                                    <img src={conv.otherUser.profilePhoto} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    conv.otherUser?.name?.charAt(0) || '?'
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-white truncate">{conv.otherUser?.name}</p>
                                                <p className="text-xs text-dark-400 truncate">{conv.lastMessage}</p>
                                            </div>
                                            {conv.unreadCount > 0 && (
                                                <span className="w-5 h-5 rounded-full bg-primary-500 text-white text-xs flex items-center justify-center">{conv.unreadCount}</span>
                                            )}
                                        </button>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Chat Area */}
                        <div className={`flex-1 flex flex-col ${!activeChat ? 'hidden md:flex' : 'flex'}`}>
                            {activeChat ? (
                                <>
                                    {/* Chat Header */}
                                    <div className="p-4 border-b border-white/10 flex items-center gap-3">
                                        <button onClick={() => setActiveChat(null)} className="md:hidden text-dark-300 hover:text-white">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                                        </button>
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white text-xs font-bold overflow-hidden">
                                            {activeChat.otherUser?.profilePhoto ? (
                                                <img src={activeChat.otherUser.profilePhoto} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                activeChat.otherUser?.name?.charAt(0) || '?'
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-white">{activeChat.otherUser?.name}</p>
                                        </div>
                                    </div>

                                    {/* Messages */}
                                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                                        {messages.map((msg, i) => {
                                            const isMe = msg.sender?._id === user?.id || msg.sender === user?.id;
                                            return (
                                                <div key={msg._id || i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                                    <div className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-sm ${isMe
                                                        ? 'bg-primary-500 text-white rounded-br-sm'
                                                        : 'bg-white/10 text-dark-200 rounded-bl-sm'
                                                        }`}>
                                                        <p>{msg.content}</p>
                                                        <p className={`text-[10px] mt-1 ${isMe ? 'text-primary-200' : 'text-dark-500'}`}>
                                                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        <div ref={msgEndRef} />
                                    </div>

                                    {/* Message Input */}
                                    <form onSubmit={sendMessage} className="p-4 border-t border-white/10 flex gap-3">
                                        <input
                                            type="text"
                                            value={newMsg}
                                            onChange={e => setNewMsg(e.target.value)}
                                            placeholder="Type a message..."
                                            className="input-field flex-1"
                                        />
                                        <button type="submit" disabled={!newMsg.trim()} className="btn-primary !px-4 disabled:opacity-50">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                                        </button>
                                    </form>
                                </>
                            ) : (
                                <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
                                    <div className="text-6xl mb-4">💬</div>
                                    <h3 className="text-lg font-semibold text-white mb-2">Your Messages</h3>
                                    <p className="text-sm text-dark-400">Select a conversation or start one from an item page</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
