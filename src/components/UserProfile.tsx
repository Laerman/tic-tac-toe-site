import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import Icon from '@/components/ui/icon';
import UserInventory from './UserInventory';
import GameHistory from './GameHistory';

interface User {
  id: number;
  login: string;
  user?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface UserProfileProps {
  user: User;
  onLogout: () => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ user, onLogout }) => {
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = () => {
    setIsLoggingOut(true);
    localStorage.removeItem('currentUser');
    setTimeout(() => {
      onLogout();
    }, 500);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Неизвестно';
    try {
      return new Date(dateString).toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Неизвестно';
    }
  };

  const getInitials = (login: string) => {
    return login.slice(0, 2).toUpperCase();
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-2xl w-full space-y-6">
        
        {/* Заголовок */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-ocean-400 to-coral-400 bg-clip-text text-transparent">
            Добро пожаловать!
          </h1>
          <p className="text-muted-foreground">
            Ваш личный профиль готов к использованию
          </p>
        </div>

        {/* Карточка профиля */}
        <Card className="shadow-lg border border-purple-800/50 bg-purple-950/60 backdrop-blur-sm">
          <CardHeader className="text-center pb-4">
            <div className="flex flex-col items-center space-y-4">
              <Avatar className="h-20 w-20 border-4 border-purple-600 shadow-lg">
                <AvatarFallback className="text-xl font-bold bg-gradient-to-br from-ocean-500 to-coral-500 text-white">
                  {getInitials(user.login)}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-2xl">{user.login}</CardTitle>
                <div className="flex items-center justify-center gap-2 mt-2">
                  <Badge variant="secondary" className="bg-green-900/50 text-green-300 border-green-700">
                    <Icon name="CheckCircle" size={14} className="mr-1" />
                    Активный пользователь
                  </Badge>
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            
            {/* Информация о пользователе */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Icon name="User" size={20} />
                Информация о профиле
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">ID пользователя</p>
                  <p className="font-mono text-sm bg-purple-900/50 px-3 py-2 rounded border border-purple-700/50">
                    #{user.id}
                  </p>
                </div>
                
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Логин</p>
                  <p className="font-semibold">{user.login}</p>
                </div>
                
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Дата регистрации</p>
                  <p className="text-sm">{formatDate(user.createdAt)}</p>
                </div>
                
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Последнее обновление</p>
                  <p className="text-sm">{formatDate(user.updatedAt)}</p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Быстрые действия */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Icon name="Settings" size={20} />
                Быстрые действия
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Button variant="outline" className="justify-start" disabled>
                  <Icon name="Edit" size={16} className="mr-2" />
                  Редактировать профиль
                </Button>
                
                <Button variant="outline" className="justify-start" disabled>
                  <Icon name="Key" size={16} className="mr-2" />
                  Изменить пароль
                </Button>
                
                <Button variant="outline" className="justify-start" disabled>
                  <Icon name="Bell" size={16} className="mr-2" />
                  Настройки уведомлений
                </Button>
                
                <Button variant="outline" className="justify-start" disabled>
                  <Icon name="Shield" size={16} className="mr-2" />
                  Безопасность
                </Button>
              </div>
            </div>

            <Separator />

            {/* Действия с аккаунтом */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button 
                variant="outline" 
                className="flex-1"
                disabled
              >
                <Icon name="Home" size={16} className="mr-2" />
                На главную
              </Button>
              
              <Button 
                variant="destructive"
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="flex-1"
              >
                {isLoggingOut ? (
                  <Icon name="Loader2" size={16} className="mr-2 animate-spin" />
                ) : (
                  <Icon name="LogOut" size={16} className="mr-2" />
                )}
                {isLoggingOut ? 'Выход...' : 'Выйти из аккаунта'}
              </Button>
            </div>

          </CardContent>
        </Card>

        {/* Инвентарь пользователя */}
        <UserInventory userId={user.id} />

        {/* История игр */}
        <GameHistory userId={user.id} limit={10} />

        {/* Информационное сообщение */}
        <Card className="bg-ocean-900/30 border-ocean-700/50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Icon name="Info" size={20} className="text-ocean-400 mt-0.5" />
              <div className="space-y-1">
                <p className="text-ocean-200 font-medium">
                  🎉 Вы успешно вошли в систему!
                </p>
                <p className="text-ocean-300 text-sm">
                  Ваши данные надежно сохранены в PostgreSQL базе данных. 
                  В будущем здесь появятся дополнительные функции управления профилем.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
};

export default UserProfile;