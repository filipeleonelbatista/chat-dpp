'use client'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import { User } from 'lucide-react'
import Image from 'next/image'

interface Message {
  id: string
  content: string
  role: 'user' | 'assistant'
  timestamp: Date
}

interface ChatMessageProps {
  message: Message
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "flex items-start gap-3 rounded-lg p-4",
        isUser ? "bg-secondary/60" : "bg-orange-500/60"
      )}
    >
      <Avatar>
        {isUser ? (
          <AvatarFallback className="bg-secondary">
            <User />
          </AvatarFallback>
        ) : (
          <Image src="/logo.jpg" alt="CHAT DPP" width="100" height="100" className="rounded-full" />
        )}
      </Avatar>

      <div className="flex-1">
        <div className="flex items-center gap-2">
          <h3 className="font-medium">
            <b>{isUser ? 'Você' : 'Chat DPP'}</b>
          </h3>
          <span className="text-xs text-muted-foreground">
            {formatTime(message.timestamp)}
          </span>
        </div>

        <div className="mt-1 whitespace-pre-wrap">{message.content}</div>
      </div>
    </motion.div>
  )
}

function formatTime(date: Date): string {
  return new Intl.DateTimeFormat('pt-BR', {
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}