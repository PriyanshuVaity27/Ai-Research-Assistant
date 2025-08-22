import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Bot, User, ChevronDown, Paperclip, Maximize2, Minimize2, Mic } from 'lucide-react';
import { cn } from '@/lib/utils';

const ChatInterface = () => {
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<{
    id: number;
    content: string;
    sender: 'user' | 'bot';
    timestamp: Date;
  }[]>([
    {
      id: 1,
      content: "Hello! I'm your research assistant. How can I help you with your papers today?",
      sender: 'bot',
      timestamp: new Date(),
    },
  ]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isListening, setIsListening] = useState(false);

  // Voice recognition setup
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = SpeechRecognition ? new SpeechRecognition() : null;

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    
    const newUserMessage = {
      id: chatHistory.length + 1,
      content: message,
      sender: 'user' as const,
      timestamp: new Date(),
    };
    
    setChatHistory(prev => [...prev, newUserMessage]);
    setMessage('');
    
    setTimeout(() => {
      const botResponses = [
        "I found 3 papers in your library related to this topic. Would you like me to summarize them?",
        "Based on your papers, the main findings suggest that the method you're asking about has shown promising results in recent studies.",
        "According to the research you've uploaded, there are conflicting views on this topic. Some papers suggest approach A, while others favor approach B.",
        "I've analyzed your papers and created a comparison of methodologies used across them. Would you like me to elaborate on any specific one?"
      ];
      
      const randomResponse = botResponses[Math.floor(Math.random() * botResponses.length)];
      
      const newBotMessage = {
        id: chatHistory.length + 2,
        content: randomResponse,
        sender: 'bot' as const,
        timestamp: new Date(),
      };
      
      setChatHistory(prev => [...prev, newBotMessage]);
    }, 1000);
  };

  const handleVoiceInput = () => {
    if (!recognition) {
      alert('Speech recognition is not supported in your browser');
      return;
    }

    setIsListening(true);
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setMessage(transcript);
      setIsListening(false);
      
      // Automatically send the message
      const newUserMessage = {
        id: chatHistory.length + 1,
        content: transcript,
        sender: 'user' as const,
        timestamp: new Date(),
      };
      
      setChatHistory(prev => [...prev, newUserMessage]);
      
      setTimeout(() => {
        const botResponses = [
          "I found 3 papers in your library related to this topic. Would you like me to summarize them?",
          "Based on your papers, the main findings suggest that the method you're asking about has shown promising results in recent studies.",
          "According to the research you've uploaded, there are conflicting views on this topic.",
          "I've analyzed your papers and created a comparison of methodologies."
        ];
        
        const randomResponse = botResponses[Math.floor(Math.random() * botResponses.length)];
        
        const newBotMessage = {
          id: chatHistory.length + 2,
          content: randomResponse,
          sender: 'bot' as const,
          timestamp: new Date(),
        };
        
        setChatHistory(prev => [...prev, newBotMessage]);
      }, 1000);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
      alert('Error occurred in voice recognition: ' + event.error);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  return (
    <section id="chat" className="py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-3xl md:text-4xl font-bold mb-4"
          >
            Chat with Your Papers
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-light-gray/80 max-w-2xl mx-auto"
          >
            Ask questions about your documents and get instant insights
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className={cn(
            "mx-auto rounded-xl border border-white/10 bg-card shadow-xl transition-all duration-300",
            isExpanded ? "w-full" : "max-w-2xl"
          )}
        >
          <div className="flex items-center justify-between border-b border-white/10 p-4">
            <div className="flex items-center space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-electric-blue/10">
                <Bot className="h-5 w-5 text-electric-blue" />
              </div>
              <div>
                <h3 className="font-medium">Research Assistant</h3>
                <p className="text-xs text-light-gray/60">Powered by AI</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="rounded-full p-2 text-light-gray/60 hover:bg-muted hover:text-light-gray transition-colors"
              >
                {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </button>
              <button className="rounded-full p-2 text-light-gray/60 hover:bg-muted hover:text-light-gray transition-colors">
                <ChevronDown className="h-4 w-4" />
              </button>
            </div>
          </div>
          
          <div 
            className={cn(
              "flex flex-col space-y-4 overflow-y-auto p-4 transition-all",
              isExpanded ? "h-[500px]" : "h-[350px]"
            )}
          >
            {chatHistory.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  "flex max-w-[85%] animate-fade-in",
                  msg.sender === 'user' ? "ml-auto" : "mr-auto"
                )}
              >
                <div
                  className={cn(
                    "flex space-x-3",
                    msg.sender === 'user' ? "flex-row-reverse space-x-reverse" : "flex-row"
                  )}
                >
                  <div
                    className={cn(
                      "flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full",
                      msg.sender === 'user'
                        ? "bg-deep-purple/20"
                        : "bg-electric-blue/10"
                    )}
                  >
                    {msg.sender === 'user' ? (
                      <User className="h-4 w-4 text-deep-purple" />
                    ) : (
                      <Bot className="h-4 w-4 text-electric-blue" />
                    )}
                  </div>
                  <div
                    className={cn(
                      "rounded-xl p-3",
                      msg.sender === 'user'
                        ? "bg-deep-purple/20 text-white"
                        : "bg-muted text-light-gray"
                    )}
                  >
                    <p className="text-sm">{msg.content}</p>
                    <p className="mt-1 text-right text-xs opacity-50">
                      {msg.timestamp.toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="border-t border-white/10 p-4">
            <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
              <button
                type="button"
                className="rounded-full p-2 text-light-gray/60 hover:bg-muted hover:text-light-gray transition-colors"
              >
                <Paperclip className="h-5 w-5" />
              </button>
              
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Ask about your papers..."
                className="flex-1 bg-muted rounded-lg border border-white/10 px-3 py-2 text-light-gray placeholder:text-light-gray/50 focus:outline-none focus:ring-1 focus:ring-electric-blue/50"
              />
              
              <button
                type="button"
                onClick={handleVoiceInput}
                className={cn(
                  "rounded-full p-2 transition-all",
                  isListening
                    ? "text-electric-blue animate-pulse"
                    : "text-light-gray/60 hover:bg-muted hover:text-light-gray"
                )}
              >
                <Mic className="h-5 w-5" />
              </button>

              <button
                type="submit"
                disabled={!message.trim()}
                className={cn(
                  "rounded-lg p-2 transition-all",
                  message.trim()
                    ? "bg-electric-blue text-black hover:bg-electric-blue/90"
                    : "bg-muted text-light-gray/50 cursor-not-allowed"
                )}
              >
                <Send className="h-5 w-5" />
              </button>
            </form>
            
            <div className="mt-3 flex justify-center">
              <div className="flex items-center space-x-2 rounded-full bg-muted px-3 py-1.5">
                <span className="h-2 w-2 animate-pulse rounded-full bg-electric-blue" />
                <span className="text-xs text-light-gray/60">
                  Connected to 3 research papers
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </div７
    </section>
  );
};

export default ChatInterface;