"use client";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { FileUp, Grid3x3, User } from "lucide-react";

interface SidebarProps {
  currentView: string;
  setCurrentView: (view: string) => void;
}

export function Sidebar({ currentView, setCurrentView }: SidebarProps) {
  const navItems = [
    {
      id: "gallery",
      label: "Galeria",
      icon: Grid3x3,
      description: "Visualize todos os seus arquivos",
    },
    {
      id: "upload",
      label: "Upload",
      icon: FileUp,
      description: "Envie novos arquivos",
    },
    {
      id: "profile",
      label: "Perfil",
      icon: User,
      description: "Gerencione sua conta",
    },
  ];

  return (
    <TooltipProvider>
      <nav className="space-y-2 p-4">
        <p className="px-2 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          Menu
        </p>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;

          return (
            <Button
              key={item.id}
              variant={isActive ? "default" : "ghost"}
              className="w-full justify-start gap-3 h-auto py-3 px-3"
              onClick={() => setCurrentView(item.id)}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              <div className="text-left min-w-0 flex-1">
                <p className="font-medium">{item.label}</p>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <p className="text-xs text-muted-foreground hidden sm:block line-clamp-2 cursor-help break-words">
                      {item.description}
                    </p>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p>{item.description}</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </Button>
          );
        })}
      </nav>
    </TooltipProvider>
  );
}
