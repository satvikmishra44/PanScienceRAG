import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Simple Message Bubble Component
const ChatMessage = ({ msg }) => {
    const isUser = msg.sender === 'user';
    const bubbleClasses = isUser 
        ? "bg-indigo-600 text-white self-end rounded-br-none" 
        : "bg-gray-200 text-gray-800 self-start rounded-tl-none";
    const containerClasses = isUser ? "justify-end" : "justify-start";

    return (
        <div className={`flex w-full mt-2 ${containerClasses}`}>
            <div className={`max-w-xs md:max-w-md lg:max-w-lg p-3 rounded-xl shadow-md ${bubbleClasses}`}>
                <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                
                {msg.sender === 'ai' && msg.sources && msg.sources.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-opacity-30 border-gray-400 text-xs text-gray-600">
                        <p className="font-semibold">Sources:</p>
                        <ul className="list-disc list-inside space-y-0.5">
                            {/* Display unique source filenames */}
                            {Array.from(new Set(msg.sources)).map((source, i) => (
                                <li key={i} className="truncate">{source}</li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
};


function Chat({backendUrl}) {

    const [messages, setMessages] =  useState([]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const msgRef = useRef(null);
    const navigate = useNavigate();

    const toBottom = () => {
        msgRef.current?.scrollIntoView({behavior: "smooth"})
    }

    const handleQuery = async (query) => {
        if(!query.trim()){
            return ;
        }

        const userMsg = {sender: "user", text: query};
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsTyping(true);

        try{

            const history = messages.slice(-6).map(msg=> ({
                role: msg.sender,
                text: msg.text
            }));

            const request = {
                query: query,
                top_k: 4,
                history: history.length > 0 ? history : undefined
            }

            // const params = new URLSearchParams({query: query, top_k: 4});
            const url = `${backendUrl}/query`;
            const response = await fetch(url, {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(request)});

            if(!response.ok){
                throw new Error('RAG query failed')
            }

            const data = await response.json();

            const aiMsg = {sender: 'ai', text: data.answer, sources: data.sources.map(s=>s.meta.source_filename)};
            setMessages(prev => [...prev, aiMsg]);
        } catch(err){
            console.error("Query Error: ", err);
            setMessages(prev => [...prev, {sender: 'ai', text: `Error: ${err.message}`}])
        } finally{
            setIsTyping(false);
            toBottom();
        }
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        handleQuery(input);
    }

    return (
        <div className="p-6 bg-white shadow-xl rounded-xl h-full flex flex-col">
            <h2 className="text-2xl font-bold text-gray-800 border-b text-center pb-3 mb-4">
                PanScience AI
            </h2>

            {/* Message Display Area (Chat History) */}
            <div className="flex-grow overflow-y-auto space-y-3 p-2 bg-gray-50 rounded-lg border border-gray-100 mb-4">
                    <div className='text-center p-10 text-gray-500 italic cursor-pointer' onClick={() => navigate('/docs')}>
                        <div>
                            Ask a question about your indexed documents to begin.
                        </div>
                        <div>
                            Click Here To See Indexed Documents Or Add One
                        </div>
                    </div>
                {messages.length === 0 ? <br/> : <hr/>}
                {messages.map((msg, index) => (
                    <ChatMessage key={index} msg={msg} />
                ))}
                
                {isTyping && (
                    <div className="flex w-full justify-start mt-2">
                        <div className="p-3 rounded-xl bg-gray-200 text-gray-600 text-sm shadow-md animate-pulse">
                            AI is thinking...
                        </div>
                    </div>
                )}
                <div ref={msgRef} />
            </div>

            {/* Input Form */}
            <form onSubmit={handleSubmit} className="flex space-x-3">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type your question here..."
                    disabled={isTyping}
                    className="flex-grow p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100"
                />
                <button 
                    type="submit" 
                    disabled={isTyping || !input.trim()}
                    className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 disabled:bg-gray-400 transition duration-150"
                >
                    Send
                </button>
            </form>
        </div>
    );
}

export default Chat;