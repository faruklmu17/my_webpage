"use client";

import { useState, useEffect, useRef } from 'react';
import { Client } from '@gradio/client';
import { marked } from 'marked';

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [gradioApp, setGradioApp] = useState<any>(null);
  const [chatSessionHistory, setChatSessionHistory] = useState<any[]>([]);
  const [messages, setMessages] = useState<Array<{text: string, sender: 'user'|'bot'}>>([]);
  const [inputValue, setInputValue] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [showBubble, setShowBubble] = useState(false);
  const [bubbleDismissed, setBubbleDismissed] = useState(false);

  const chatHistoryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Show bubble after 3 seconds
    const timer = setTimeout(() => {
      if (!isOpen && !bubbleDismissed) {
        setShowBubble(true);
      }
    }, 3000);
    return () => clearTimeout(timer);
  }, [isOpen, bubbleDismissed]);

  useEffect(() => {
    if (chatHistoryRef.current) {
      chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
    }
  }, [messages, isThinking]);

  const loadChatbot = async () => {
    if (!isLoaded) {
      try {
        const app = await Client.connect("https://hasanfaruk25-faruk-assistant.hf.space/gradio/");
        setGradioApp(app);
        setMessages([
          { text: "Hi! I'm Faruk's AI assistant. Feel free to ask me anything about his projects, skills, or experience!", sender: 'bot' }
        ]);
        setIsLoaded(true);
      } catch (error) {
        console.error("Failed to connect to Gradio:", error);
      }
    }
  };

  const openChatbot = () => {
    setIsOpen(true);
    setShowBubble(false);
    setBubbleDismissed(true);
    loadChatbot();
    if (window.innerWidth <= 768) {
      document.body.style.overflow = 'hidden';
    }
  };

  const closeChatbot = () => {
    setIsOpen(false);
    document.body.style.overflow = 'auto';
  };

  const toggleChatbot = () => {
    if (isOpen) {
      closeChatbot();
    } else {
      openChatbot();
    }
  };

  const sendMessage = async () => {
    const text = inputValue.trim();
    if (!text || !gradioApp) return;

    setInputValue('');
    setMessages(prev => [...prev, { text, sender: 'user' }]);
    setIsThinking(true);

    try {
      const result = await gradioApp.predict("/chat_fn", [text, chatSessionHistory]);
      
      let botResponse = "Error parsing response.";
      if (result && result.data && result.data.length > 1) {
         const historyArray = result.data[1];
         if (historyArray.length > 0) {
           botResponse = historyArray[historyArray.length - 1].content;
           setChatSessionHistory(historyArray);
         }
      }
      
      setMessages(prev => [...prev, { text: botResponse, sender: 'bot' }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { text: "Sorry, I encountered an error connecting to the AI. Please try again.", sender: 'bot' }]);
    } finally {
      setIsThinking(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  return (
    <div className="chatbot-container">
      {/* Chatbot Welcome Bubble */}
      <div className={`chatbot-tooltip ${showBubble ? 'show' : ''}`} id="chatbot-welcome-bubble">
        <div className="tooltip-header">
          <span><i className="fas fa-sparkles"></i> AI Assistant</span>
          <button className="tooltip-close" onClick={() => { setShowBubble(false); setBubbleDismissed(true); }} aria-label="Close tooltip">&times;</button>
        </div>
        <div className="tooltip-body">
          Hi there! 👋 How can I help? I am Faruk&apos;s AI assistant!
        </div>
      </div>

      {/* Minimized Chatbot Button */}
      <button className="chatbot-toggle" onClick={toggleChatbot} aria-label="Open Chat Assistant" style={{ transform: isOpen ? 'scale(0.9)' : 'scale(1)' }}>
        <i className="fas fa-robot chat-icon" style={{ fontSize: '24px' }}></i>
        {!isOpen && !bubbleDismissed && <div className="notification-badge">1</div>}
      </button>

      {/* Expanded Chatbot Window */}
      <div className={`chatbot-window ${isOpen ? 'active' : ''}`} id="chatbot-window">
        <div className="chatbot-header">
          <div className="chatbot-title" style={{ color: '#38bdf8' }}>
            <div className="chatbot-status">
              <div className="status-indicator"></div>
              <span className="status-text" style={{ color: '#94a3b8' }}>Online</span>
            </div>
            <div className="chatbot-name">
              <i className="fas fa-robot chatbot-icon" style={{ color: '#38bdf8' }}></i>
              <span style={{ color: '#38bdf8' }}>AI Bot v1.0</span>
            </div>
          </div>
          <button className="minimize-btn" onClick={closeChatbot} aria-label="Minimize Chat">
            <svg className="minimize-icon" viewBox="0 0 24 24">
              <path d="M19 13H5v-2h14v2z" />
            </svg>
          </button>
        </div>

        {!isLoaded && isOpen && (
          <div className="chatbot-loading" style={{ display: 'flex' }}>
            <div className="loading-spinner"></div>
            <div className="loading-text">Loading AI Assistant...</div>
          </div>
        )}

        {isLoaded && (
          <div className="chatbot-content">
            <div className="chat-history" ref={chatHistoryRef}>
              {messages.map((msg, idx) => (
                <div key={idx} className={`chat-message-wrapper ${msg.sender}`}>
                  <div className={`chat-avatar ${msg.sender}`}>
                    {msg.sender === 'bot' ? <i className="fas fa-robot"></i> : <i className="fas fa-user"></i>}
                  </div>
                  <div className={`chat-message ${msg.sender}`} dangerouslySetInnerHTML={{ __html: msg.sender === 'bot' ? marked.parse(msg.text) as string : msg.text.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" style="color: inherit; text-decoration: underline; font-weight: 600;">$1</a>') }} />
                </div>
              ))}
              
              {isThinking && (
                <div className="chat-message-wrapper bot loading-wrapper">
                  <div className="chat-avatar bot">
                    <i className="fas fa-robot"></i>
                  </div>
                  <div className="chat-message bot loading-msg">
                    <i className="fas fa-circle-notch fa-spin"></i> Thinking...
                  </div>
                </div>
              )}
            </div>
            <div className="chat-input-area">
              <input 
                type="text" 
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..." 
                autoComplete="off" 
                disabled={isThinking}
              />
              <button id="chat-send-btn" onClick={sendMessage} disabled={isThinking || !inputValue.trim()} aria-label="Send message">
                <i className="fas fa-paper-plane"></i>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
