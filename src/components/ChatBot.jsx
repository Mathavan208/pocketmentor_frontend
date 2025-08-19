import React, { useState, useRef, useEffect } from 'react';
import { FiSend, FiX, FiMessageSquare, FiBook, FiUsers, FiCalendar, FiDollarSign, FiInfo } from 'react-icons/fi';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { 
      id: 1, 
      text: "Hello! I'm your learning assistant. I can help you with:\n\n• Course information\n• Workshop schedules\n• Instructor details\n• Enrollment process\n• Payment options\n\nHow can I assist you today?", 
      sender: 'bot',
      options: [
        { id: 1, text: 'Available Courses', icon: <FiBook /> },
        { id: 2, text: 'Workshop Schedules', icon: <FiCalendar /> },
        { id: 3, text: 'Instructor Profiles', icon: <FiUsers /> },
        { id: 4, text: 'Payment Options', icon: <FiDollarSign /> },
        { id: 5, text: 'General Information', icon: <FiInfo /> }
      ]
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showOptions, setShowOptions] = useState(true);
  const [userId, setUserId] = useState('');
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Get user ID from context or local storage
  useEffect(() => {
    // This should be replaced with your actual user context
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.id) {
      setUserId(user.id);
    }
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleOptionClick = (optionText) => {
    setInputValue(optionText);
    handleSendMessage();
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;
    
    // Hide options when user sends a message
    setShowOptions(false);
    
    const userMessage = {
      id: messages.length + 1,
      text: inputValue,
      sender: 'user'
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    
    try {
      // Using your fine-tuned model API
      const response = await fetch('http://localhost:8000/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          message: inputValue,
          user_id: userId
        })
      });
      
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      
      const data = await response.json();
      const botMessage = {
        id: messages.length + 2,
        text: data.response,
        sender: 'bot'
      };
      
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error fetching chat response:', error);
      const errorMessage = {
        id: messages.length + 2,
        text: "I'm sorry, I'm having trouble responding right now. Please try again later or contact our support team.",
        sender: 'bot'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const resetChat = () => {
    setMessages([
      { 
        id: 1, 
        text: "Hello! I'm your learning assistant. I can help you with:\n\n• Course information\n• Workshop schedules\n• Instructor details\n• Enrollment process\n• Payment options\n\nHow can I assist you today?", 
        sender: 'bot',
        options: [
          { id: 1, text: 'Available Courses', icon: <FiBook /> },
          { id: 2, text: 'Workshop Schedules', icon: <FiCalendar /> },
          { id: 3, text: 'Instructor Profiles', icon: <FiUsers /> },
          { id: 4, text: 'Payment Options', icon: <FiDollarSign /> },
          { id: 5, text: 'General Information', icon: <FiInfo /> }
        ]
      }
    ]);
    setShowOptions(true);
  };

  return (
    <div className="fixed z-50 bottom-6 right-6">
      {!isOpen ? (
        <button 
          onClick={() => setIsOpen(true)}
          className="flex items-center justify-center text-white transition-all duration-300 rounded-full shadow-lg w-14 h-14 bg-gradient-to-r from-deep-blue to-purple-blue hover:from-purple-blue hover:to-light-blue"
        >
          <FiMessageSquare className="text-xl" />
        </button>
      ) : (
        <div className="flex flex-col items-end">
          <button 
            onClick={() => setIsOpen(false)}
            className="p-2 mb-2 text-gray-600 bg-white rounded-full shadow-md hover:bg-gray-100"
          >
            <FiX className="text-xl" />
          </button>
          
          <div className="flex flex-col bg-white shadow-xl w-80 h-96 rounded-t-xl">
            {/* Chat header */}
            <div className="flex items-center justify-between p-4 text-white bg-gradient-to-r from-deep-blue to-purple-blue rounded-t-xl">
              <div>
                <h3 className="font-bold">Learning Assistant</h3>
                <p className="text-xs opacity-80">Powered by Fine-Tuned LLaMA</p>
              </div>
              <button 
                onClick={resetChat}
                className="p-1 rounded-full hover:bg-white hover:bg-opacity-20"
                title="Reset conversation"
              >
                <FiX />
              </button>
            </div>
            
            {/* Messages container */}
            <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
              {messages.map((message) => (
                <div 
                  key={message.id} 
                  className={`mb-3 ${message.sender === 'user' ? 'text-right' : ''}`}
                >
                  {message.options ? (
                    <div className="mb-3">
                      <div className="inline-block p-3 rounded-2xl max-w-[80%] bg-white text-gray-700 rounded-bl-none shadow">
                        {message.text}
                      </div>
                      <div className="flex flex-wrap justify-center gap-2 mt-2">
                        {message.options.map((option) => (
                          <button
                            key={option.id}
                            onClick={() => handleOptionClick(option.text)}
                            className="flex flex-col items-center justify-center w-20 p-2 transition-shadow bg-white rounded-lg shadow hover:shadow-md"
                          >
                            <div className="mb-1 text-deep-blue">{option.icon}</div>
                            <span className="text-xs text-center">{option.text}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div 
                      className={`inline-block p-3 rounded-2xl max-w-[80%] ${
                        message.sender === 'user' 
                          ? 'bg-gradient-to-r from-deep-blue to-purple-blue text-white rounded-br-none' 
                          : 'bg-white text-gray-700 rounded-bl-none shadow'
                      }`}
                    >
                      {message.text}
                    </div>
                  )}
                </div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start mb-3">
                  <div className="inline-block p-3 text-gray-700 bg-white rounded-bl-none shadow rounded-2xl">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
            
            {/* Input area */}
            <div className="p-3 bg-white border-t border-gray-200 rounded-b-xl">
              <div className="flex items-center">
                <textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  className="flex-1 p-2 mr-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-purple-blue"
                  rows={1}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={isLoading}
                  className="p-2 text-white rounded-lg bg-gradient-to-r from-deep-blue to-purple-blue hover:from-purple-blue hover:to-light-blue disabled:opacity-50"
                >
                  <FiSend />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chatbot;