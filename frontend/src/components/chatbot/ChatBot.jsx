import React from 'react';
import { useState, useRef, useEffect } from 'react';
import ChatbotIcon from './ChatbotIcon.jsx';
import  ChatForm  from './ChatForm.jsx';
import ChatMessage from './ChatMessage.jsx';
import { companyInfo } from './companyInfo.js';

const ChatBot = () => {
  const [chatHistory, setChatHistory] = useState([{
    hideInChat  :true,
    role: 'model',
    text: companyInfo
  }
  ]);
  const [showChatbot, setShowChatbot] = useState(false);
  const chatBodyRef = useRef();
  

  const handleToggleChatbot = () => {
    setShowChatbot(prev => !prev);
  }


  const generateBotResponse = async(history) => { 
    //helper function to uupdate chat history
    const updateHistory = (text, isError = false) => {
      setChatHistory(prev => [...prev.filter(msg => msg.text!== "Thinking..."  ), { role: 'model', text, isError }]);
    }
    //format chat for API
    history = history.map(({role,text})=> ({
      role,
        parts: [{ text }],
    }));

    const requestOptions = { 
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json'
       },
      body: JSON.stringify({
        contents: history
      })
    };


    try{
      //make api call to get reply
       const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${import.meta.env.VITE_API_KEY}`,
        requestOptions
    );
       const data = await response.json();
       if(!response.ok) { throw new Error(data.error.message || 'Something went wrong')};

       const apiResponseText = data.candidates[0].content.parts[0].text.replace(/\*\*(.*?)\*\*/g,"$1").trim() ;
       updateHistory(apiResponseText);
       console.log(data);
    }catch(err){
      console.error(err.message,true);
    }
  };

  useEffect(() => {
    // Scroll to the bottom of the chat body when new messages are added
    chatBodyRef.current.scrollTo({ top: chatBodyRef.current.scrollHeight, behavior: "smooth" });
  }, [chatHistory]);

  return (
    <div className={`container ${showChatbot ? 'show-chatbot' : ''}`}>
      <button id="chatbot-toggle" className="chatbot-toggle" onClick={handleToggleChatbot}>
        <span className="material-symbols-outlined">mode_comment</span>
        <span className="material-symbols-outlined">close</span>
      </button> 
      <div className="chatbot-popup">
        {/* chatbot Header */}
        <div className="chat-header">
          <div className="header-info">
            <ChatbotIcon />
            <h2 className='logo-text'>Chatbot</h2>
          </div>
          <button className="material-symbols-outlined" onClick={handleToggleChatbot}>keyboard_arrow_down</button>   
        </div>
        {/* Chatbot Body */}
        <div  ref = {chatBodyRef} className="chat-body">
          {/* bot message */}
          <div className="message bot-message">
            <ChatbotIcon />
            <p className="message-text">Hello! How can I assist you today?</p>
          </div>


          {/* Render chat history dynamically */}
          {chatHistory.map((chat, index) => (
            <ChatMessage key={index} role={chat.role} chat={chat} text={chat.text} />
          ))}

        </div>
        {/* chatbot footer */}
        <div className="chat-footer">
          <ChatForm chatHistory={chatHistory} setChatHistory={setChatHistory} generateBotResponse={generateBotResponse}/>
        </div>
      </div>
    </div>
  )
}


export default ChatBot;