import React from "react";
import { useRef, useState } from "react";

const ChatForm = ({ chatHistory, setChatHistory, generateBotResponse }) => {
  const inputRef = useRef();
  // const [prompt, setPrompt] = useState("");

  // const handleChange = (e) => {
  //   e.preventDefault();
  //   setPrompt(e.target.value);
  // };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const userMessage = inputRef.current.value.trim();
    if (!userMessage) return;
    console.log("User Message:", userMessage);
    inputRef.current.value = "";

    // const options = {
    //   method: "POST",
    //   headers: {
    //     "Content-Type": "application/json",
    //   },
    //   body: JSON.stringify({
    //     message: prompt,
    //     threadId: currThreadId,
    //   }),
    // };

    //update chat history with the user's message
    setChatHistory((history) => [ ...history,{ role: "user", text: userMessage },]);

    //Adding a " Thinking ..." bot message after a delay
    setTimeout(() => {
      setChatHistory((history) => [...history,{ role: "model", text: "Thinking..." }]);

      //call fun to generate bot response
      generateBotResponse([...chatHistory,{ role: "user", text: `Using the details provided above, please address this query : ${userMessage}` },]);
    }, 600);
  };

  return (
    <form action="#" className="chat-form" onSubmit={handleFormSubmit}>
      <input
        ref={inputRef}
        type="text"
        placeholder="Message..."
        className="message-input"
        required
      />
      <button className="material-symbols-outlined">arrow_upward</button>
    </form>
  );
};

export default ChatForm;
