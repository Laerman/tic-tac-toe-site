import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trophy, User, Award, Settings, Package } from "lucide-react";
import { useNavigate } from "react-router-dom";
import CharacterEquipment from "@/components/CharacterEquipment";
import ItemDetails from "@/components/Inventory/ItemDetails";

const Profile: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  // Если пользователь не авторизован, перенаправляем на страницу входа
  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  if (!user) {
    return <div className="container py-10">Загрузка профиля...</div>;
  }

  // Получаем инициалы пользователя
  const getInitials = (name: string) => {
    return name.charAt(0).toUpperCase();
  };

  return (
    <div className="container py-10">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-8">
          <Avatar className="h-20 w-20 mr-4">
            <AvatarFallback className="text-2xl">{getInitials(user.username)}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold">{user.username}</h1>
            <p className="text-muted-foreground">{user.email}</p>
            <div className="mt-1">
              <Badge variant="outline">{user.role === "admin" ? "Администратор" : "Игрок"}</Badge>
            </div>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2">
            <div className="grid gap-6 md:grid-cols-2 mb-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Trophy className="mr-2 h-5 w-5" /> Игровая статистика
                  </CardTitle>
                  <CardDescription>Ваши достижения в крестиках-ноликах</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Всего игр:</span>
                      <span className="font-medium">12</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Победы:</span>
                      <span className="font-medium text-green-600">7</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Поражения:</span>
                      <span className="font-medium text-red-600">3</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Ничьи:</span>
                      <span className="font-medium">2</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t">
                      <span>Рейтинг:</span>
                      <span className="font-bold">1250</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Award className="mr-2 h-5 w-5" /> Достижения
                  </CardTitle>
                  <CardDescription>Ваши разблокированные награды</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <Badge className="mr-2 bg-yellow-500">🥇</Badge>
                      <div>
                        <div className="font-medium">Первая победа</div>
                        <div className="text-sm text-gray-500">Выиграйте свою первую игру</div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Badge className="mr-2 bg-purple-900/50 text-purple-300">🏆</Badge>
                      <div>
                        <div className="font-medium text-muted-foreground">Мастер игры</div>
                        <div className="text-sm text-muted-foreground">Выиграйте 10 игр подряд</div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Badge className="mr-2 bg-purple-900/50 text-purple-300">⚡</Badge>
                      <div>
                        <div className="font-medium text-muted-foreground">Молниеносный</div>
                        <div className="text-sm text-muted-foreground">Выиграйте игру за менее чем 15 секунд</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="mr-2 h-5 w-5" /> Личная информация
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="font-medium">ID пользователя:</span>
                    <span>{user.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Имя пользователя:</span>
                    <span>{user.username}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Email:</span>
                    <span>{user.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Статус:</span>
                    <span>{user.role === "admin" ? "Администратор" : "Пользователь"}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button variant="outline" className="flex items-center">
                  <Settings className="mr-2 h-4 w-4" /> Настройки профиля
                </Button>
              </CardFooter>
            </Card>
          </div>

          <div>
            <CharacterEquipment onItemSelect={setSelectedItemId} />
            
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Package className="mr-2 h-5 w-5" /> Инвентарь
                </CardTitle>
                <CardDescription>Управление вашими предметами</CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  className="w-full" 
                  variant="outline"
                  onClick={() => navigate('/inventory')}
                >
                  Открыть инвентарь
                </Button>
              </CardContent>
            </Card>

            {selectedItemId && (
              <div className="mt-6">
                <ItemDetails 
                  itemId={selectedItemId} 
                  onClose={() => setSelectedItemId(null)} 
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;