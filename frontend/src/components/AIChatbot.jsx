import { useState, useRef, useEffect } from 'react'
import { FaRobot, FaXmark, FaPaperPlane } from 'react-icons/fa6'
import { networkApi } from '../services/api'

export default function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([{ sender: 'ai', text: 'Hello! I am your AI assistant. How can I help you with blood donation today?' }])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async (e) => {
    e.preventDefault()
    if (!input.trim()) return

    const userMsg = input.trim()
    setMessages(prev => [...prev, { sender: 'user', text: userMsg }])
    setInput('')
    setLoading(true)

    try {
      const { data } = await networkApi.chatAI({ message: userMsg })
      setMessages(prev => [...prev, { sender: 'ai', text: data.reply }])
    } catch (error) {
      setMessages(prev => [...prev, { sender: 'ai', text: 'Sorry, I encountered an error connecting to the server.' }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 p-4 rounded-full bg-blood-600 text-white shadow-lg transition-transform hover:scale-110 z-50 ${isOpen ? 'hidden' : 'block'}`}
      >
        <FaRobot size={24} />
      </button>

      {isOpen && (
        <div className="fixed bottom-6 right-6 w-80 sm:w-96 glass rounded-xl shadow-2xl z-50 flex flex-col overflow-hidden border border-white/20 dark:border-slate-800">
          <div className="bg-blood-600 text-white p-4 flex justify-between items-center">
            <h3 className="font-bold flex items-center gap-2"><FaRobot /> AI Assistant</h3>
            <button onClick={() => setIsOpen(false)} className="hover:text-slate-200 transition-colors">
              <FaXmark size={20} />
            </button>
          </div>
          
          <div className="h-96 overflow-y-auto p-4 flex flex-col gap-3 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md">
            {messages.map((msg, idx) => (
              <div key={idx} className={`max-w-[85%] rounded-lg p-3 text-sm ${msg.sender === 'user' ? 'bg-blood-500 text-white self-end rounded-tr-none' : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 self-start rounded-tl-none shadow-sm'}`}>
                {msg.text}
              </div>
            ))}
            {loading && (
              <div className="bg-slate-100 dark:bg-slate-800 text-slate-500 self-start p-3 rounded-lg rounded-tl-none text-xs italic shadow-sm">
                AI is typing...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSend} className="p-3 border-t border-white/20 dark:border-slate-700 bg-white dark:bg-slate-900 flex gap-2">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question..."
              className="flex-1 bg-slate-100 dark:bg-slate-800 border-none rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blood-500 outline-none"
            />
            <button type="submit" disabled={loading} className="p-2 rounded-lg bg-blood-600 text-white hover:bg-blood-700 transition-colors disabled:opacity-50">
              <FaPaperPlane />
            </button>
          </form>
        </div>
      )}
    </>
  )
}
