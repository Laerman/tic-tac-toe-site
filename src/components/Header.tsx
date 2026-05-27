import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User, Package } from "lucide-react";
import UnderwaterIcon from "@/components/UnderwaterIcon";

const Header: React.FC = () => {
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  
  // Если мы на странице авторизации или регистрации, не показываем хедер
  if (location.pathname === "/login" || location.pathname === "/register") {
    return null;
  }
  
  // Получаем инициалы пользователя
  const getInitials = (name: string) => {
    return name.charAt(0).toUpperCase();
  };

  return (
    <header className="border-b border-ocean-800/50 backdrop-blur-sm bg-purple-950/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2">
            <UnderwaterIcon emoji="🐋" className="text-2xl" delay={0.5} />
            <span className="text-xl font-bold text-ocean-300">SVOIKIT</span>
            <span className="text-sm text-muted-foreground hidden sm:inline-block">свой кит - твои игры</span>
          </Link>
          <nav className="flex items-center gap-4">
            <Link to="/" className="text-sm font-medium text-ocean-300 hover:text-white transition-colors">
              Главная
            </Link>
            {isAuthenticated && (
              <>
                <Link to="/tic-tac-toe" className="text-sm font-medium text-ocean-300 hover:text-white transition-colors flex items-center">
                  <UnderwaterIcon emoji="🎮" className="text-sm mr-1" delay={1} />
                  Играть
                </Link>
              </>
            )}
          </nav>
        </div>
        
        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full bg-purple-800 hover:bg-purple-700">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-ocean-500 text-white">{user ? getInitials(user.username) : "U"}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="underwater-card border-none">
                <DropdownMenuItem className="font-medium cursor-default">
                  {user?.username}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/profile" className="cursor-pointer flex items-center">
                    <User className="mr-2 h-4 w-4" /> Профиль
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/inventory" className="cursor-pointer flex items-center">
                    <Package className="mr-2 h-4 w-4" /> Инвентарь
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={logout}>
                  Выйти
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Link to="/login">
                <Button variant="outline" size="sm" className="border-purple-600 text-ocean-200 hover:bg-purple-800/50 bg-transparent backdrop-blur-sm">
                  Войти
                </Button>
              </Link>
              <Link to="/register">
                <Button size="sm" className="coral-button">
                  Регистрация
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;