'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Menu, X, Youtube, History, Settings, MessageSquare, Gamepad2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from '@/components/ui/sidebar'

export default function ChatSidebar() {
  const gameCategories = [
    { name: 'GTA Online', count: 156 },
    { name: 'Easter Eggs', count: 42 },
    { name: 'Origins', count: 8 },
    { name: 'Outros Jogos', count: 78 }
  ]
  
  return (
    <SidebarProvider>
      <Sidebar className="border-r">
        <SidebarHeader className="border-b px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-500 text-white">
              <Gamepad2 className="h-4 w-4" />
            </div>
            <div>
              <h1 className="text-lg font-bold">Chat DPP</h1>
              <p className="text-xs text-muted-foreground">Desce Pro Play</p>
            </div>
            <SidebarTrigger className="ml-auto md:hidden" />
          </div>
        </SidebarHeader>
        
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton>
                <MessageSquare className="mr-2 h-4 w-4" />
                Nova Conversa
              </SidebarMenuButton>
            </SidebarMenuItem>
            
            <SidebarMenuItem>
              <SidebarMenuButton>
                <History className="mr-2 h-4 w-4" />
                Histórico
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
          
          <SidebarGroup>
            <SidebarGroupLabel>Categorias de Conteúdo</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {gameCategories.map((category) => (
                  <SidebarMenuItem key={category.name}>
                    <SidebarMenuButton className="justify-between">
                      {category.name}
                      <span className="ml-auto text-xs text-muted-foreground">
                        {category.count}
                      </span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
          
          <div className="px-4 py-2 mt-4">
            <div className="rounded-md bg-orange-500/10 p-3 border border-orange-500/20">
              <div className="font-medium">Desce Pro Play</div>
              <div className="mt-1 text-xs text-muted-foreground">
                183K inscritos • 4.4K vídeos
              </div>
              <div className="mt-2 text-xs">
                Vídeos novos todos os dias às 12h, 14h, 16h, 18h, 19h30 e 20h30!
              </div>
            </div>
          </div>
          
          <div className="mt-auto p-4">
            <Button variant="outline" className="w-full justify-start" size="sm">
              <Settings className="mr-2 h-4 w-4" />
              Configurações
            </Button>
            <div className="mt-2 text-xs text-center text-muted-foreground">
              <a href="https://www.youtube.com/@DesceProPlay22" target="_blank" rel="noopener noreferrer" className="hover:underline">
                Visitar Canal no YouTube
              </a>
            </div>
          </div>
        </SidebarContent>
      </Sidebar>
    </SidebarProvider>
  )
}