'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import ChatSidebar from '@/components/chat-sidebar'
import ChatMessage from '@/components/chat-message'

interface Message {
  id: string
  content: string
  role: 'user' | 'assistant'
  timestamp: Date
}

export default function Home() {

  const personas = ['Hayashii', 'Bruninho So7'];
  const [selectedPersona, setSelectedPersona] = useState(personas[Math.floor(Math.random() * personas.length)]);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: 'Olá! Pergunte-me qualquer coisa sobre o canal Desce Pro Play. Posso falar sobre GTA Online, Easter Eggs, e outros conteúdos do canal.',
      role: 'assistant',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  // Estado para controlar se o contexto inicial já foi carregado
  const [initialContextLoaded, setInitialContextLoaded] = useState(false);

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      role: 'user',
      timestamp: new Date()
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setIsLoading(true);

    try {
      // Mapeia somente os dados relevantes para o backend
      const apiMessages = updatedMessages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      // Define o flag includeInitialContext somente se ainda não foi carregado
      const payload = {
        messages: apiMessages,
        page: 1,
        includeInitialContext: !initialContextLoaded,
        selectedPersona: selectedPersona
      };

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error('Erro na resposta da API');
      }

      const data = await response.json();

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.response,
        role: 'assistant',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
      if (!initialContextLoaded) setInitialContextLoaded(true);
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: 'Desculpe, ocorreu um erro ao processar sua mensagem. Por favor, tente novamente.',
        role: 'assistant',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-background">
      {/* <ChatSidebar /> */}

      <main className="flex flex-col w-full h-full overflow-hidden relative">
        <div className='pointer-events-none select-none opacity-30 absolute top-0 bottom-0 left-0 right-0 z-10 flex gap-2 flex-col items-center justify-center'>
          <img src="logo.jpg" alt="CHAT DPP" className="w-40 h-40 rounded-full" />
          <p className='text-2xl font-bold text-center text-white'>
            CHAT DPP
          </p>
        </div>
        <div className="flex-1 overflow-y-auto p-4 z-20">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-4xl mx-auto space-y-4"
          >
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}

            {isLoading && (
              <div className="flex items-center justify-center py-4">
                <div className="animate-pulse text-muted-foreground">
                  Processando resposta...
                </div>
              </div>
            )}
          </motion.div>
        </div>

        <div className="border-t p-4">
          <div className="max-w-4xl mx-auto flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Pergunte algo sobre o Desce Pro Play..."
              className="flex-1"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
            />
            <Button
              onClick={handleSendMessage}
              disabled={isLoading || !input.trim()}
              size="icon"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
