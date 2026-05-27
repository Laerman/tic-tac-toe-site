import React, { useState, useEffect } from "react";
import { useGame } from "@/context/GameContext";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { Badge } from "@/components/ui/badge";
import { useInventory } from "@/context/InventoryContext";
import { ItemSelector } from "@/components/Inventory/ItemSelector";
import { ItemDetails } from "@/components/Inventory/ItemDetails";
import UnderwaterIcon from "@/components/UnderwaterIcon";
import { AlertCircle, Bot, RefreshCcw } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const GameLobby: React.FC = () => {
  const { availableRooms, createRoom, joinRoom, spectateRoom, refreshRooms } = useGame();
  const { user } = useAuth();
  const { inventory } = useInventory();
  
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [showCreateSelector, setShowCreateSelector] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [joinError, setJoinError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Получаем выбранный предмет из инвентаря
  const selectedItem = selectedItemId 
    ? inventory?.items.find(item => item.item.id === selectedItemId)
    : null;
  
  // Проверяем, не участвует ли уже текущий пользователь в какой-то комнате
  const userInGame = availableRooms.some(room => 
    room.players.some(player => player.username === user?.username)
  );
  
  // Обработчик создания новой комнаты
  const handleCreateRoom = () => {
    if (selectedItemId) {
      createRoom(selectedItemId);
      setSelectedItemId(null);
      setShowCreateSelector(false);
    }
  };
  
  // Обработчик присоединения к комнате
  const handleJoinRoom = () => {
    setJoinError(null); // Сбрасываем ошибку перед новой попыткой
    
    if (selectedItemId && selectedRoomId) {
      try {
        joinRoom(selectedRoomId, selectedItemId);
        setSelectedItemId(null);
        setSelectedRoomId(null);
      } catch (error) {
        if (error instanceof Error) {
          setJoinError(error.message);
        } else {
          setJoinError("Не удалось присоединиться к комнате");
        }
      }
    }
  };

  // Обработчик обновления списка комнат
  const handleRefreshRooms = async () => {
    setIsRefreshing(true);
    try {
      await refreshRooms();
    } finally {
      setIsRefreshing(false);
    }
  };
  
  // Автоматически обновляем список комнат при входе в лобби
  useEffect(() => {
    handleRefreshRooms();
    
    // Устанавливаем интервал обновления
    const interval = setInterval(() => {
      handleRefreshRooms();
    }, 10000); // Обновление каждые 10 секунд
    
    return () => clearInterval(interval);
  }, []);
  
  // Проверяем, есть ли предметы в инвентаре
  const hasItems = inventory?.items.length ? inventory.items.length > 0 : false;
  
  return (
    <div className="space-y-6">
      <div className="text-center">
        {showCreateSelector ? (
          <Card className="mx-auto max-w-md underwater-card">
            <CardHeader>
              <CardTitle className="flex items-center justify-center">
                <UnderwaterIcon emoji="🎮" className="mr-2" />
                Выберите предмет для ставки
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!hasItems && (
                <p className="text-center text-coral-500 mb-4">
                  У вас нет предметов в инвентаре. Пополните инвентарь, чтобы создать игру.
                </p>
              )}
              
              {hasItems && (
                <>
                  <ItemSelector 
                    inventoryItems={inventory?.items || []} 
                    onSelectItem={setSelectedItemId}
                    selectedItemId={selectedItemId}
                  />
                  
                  {selectedItem && (
                    <div className="mt-4">
                      <h3 className="font-medium mb-2">Выбранный предмет:</h3>
                      <ItemDetails item={selectedItem.item} />
                    </div>
                  )}
                </>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => {
                setShowCreateSelector(false);
                setSelectedItemId(null);
              }} className="border-purple-600 bg-purple-900/40 hover:bg-purple-800/50 text-foreground">
                Отмена
              </Button>
              <Button 
                onClick={handleCreateRoom} 
                disabled={!selectedItemId || userInGame}
                className="ocean-button"
              >
                Создать комнату
              </Button>
            </CardFooter>
          </Card>
        ) : (
          <Button 
            onClick={() => setShowCreateSelector(true)} 
            size="lg" 
            className="ocean-button px-8"
            disabled={userInGame || !hasItems}
          >
            <UnderwaterIcon emoji="🐠" className="mr-2" /> Создать комнату
          </Button>
        )}
        
        {userInGame && (
          <Alert variant="destructive" className="mt-4 max-w-md mx-auto">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Вы уже участвуете в игре. Покиньте текущую комнату, чтобы присоединиться к другой или создать новую.
            </AlertDescription>
          </Alert>
        )}
        
        {!hasItems && !showCreateSelector && (
          <Alert className="mt-4 max-w-md mx-auto bg-amber-900/30 border-amber-700/50">
            <AlertCircle className="h-4 w-4 text-amber-400" />
            <AlertDescription className="text-amber-300">
              У вас нет предметов в инвентаре. Пополните инвентарь, чтобы создать игру.
            </AlertDescription>
          </Alert>
        )}
      </div>
      
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold flex items-center">
            <UnderwaterIcon emoji="🦑" className="mr-2" />
            Доступные подводные комнаты
          </h2>
          
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleRefreshRooms} 
            disabled={isRefreshing}
            className="text-ocean-600 dark:text-ocean-300 hover:text-ocean-700 dark:hover:text-ocean-200"
          >
            <RefreshCcw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Обновить
          </Button>
        </div>
        
        {joinError && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{joinError}</AlertDescription>
          </Alert>
        )}
        
        {availableRooms.length === 0 ? (
          <div className="underwater-card text-center py-10 text-muted-foreground">
            <UnderwaterIcon emoji="🐙" size="lg" className="mb-2" />
            <p>Пока нет доступных комнат. Создайте новую!</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {availableRooms.map(room => (
              <Card key={room.id} className="underwater-card">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg flex items-center">
                      <UnderwaterIcon emoji="🎮" className="mr-2" delay={Math.random()} />
                      Комната {room.roomCode}
                    </CardTitle>
                    <Badge variant={room.status === "waiting" ? "outline" : "secondary"} className={room.status === "waiting" ? "bg-ocean-800/50 text-ocean-300 border-ocean-600" : ""}>
                      {room.status === "waiting" ? "Ожидание" : "Идет игра"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm mb-2">Создана: {new Date(room.createdAt).toLocaleString()}</p>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Игроки:</p>
                    <ul className="text-sm">
                      {room.players.map(player => (
                        <li key={player.id} className="flex items-center gap-2">
                          <span className="w-6 h-6 flex items-center justify-center rounded-full bg-ocean-700 text-ocean-200">
                            {player.symbol}
                          </span>
                          <span>{player.username}</span>
                          {player.isBot && (
                            <Bot className="h-4 w-4 text-blue-500" title="Бот" />
                          )}
                          {player.username === user?.username && (
                            <span className="text-xs text-muted-foreground">(Вы)</span>
                          )}
                        </li>
                      ))}
                      {room.status === "waiting" && room.players.length < 2 && (
                        <li className="text-muted-foreground flex items-center">
                          <span className="w-6 h-6 flex items-center justify-center rounded-full bg-muted">
                            ?
                          </span>
                          <span className="ml-2">Ожидание второго игрока...</span>
                        </li>
                      )}
                    </ul>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end gap-2 pt-2">
                  {user?.role === "admin" && (
                    <Button onClick={() => spectateRoom(room.id)} variant="outline" size="sm" className="border-purple-600 bg-purple-900/40 hover:bg-purple-800/50 text-foreground">
                      Наблюдать
                    </Button>
                  )}
                  
                  {room.status === "waiting" && room.players.length < 2 && (
                    selectedRoomId === room.id ? (
                      <Card className="w-full underwater-card">
                        <CardHeader className="py-2">
                          <CardTitle className="text-sm">Выберите предмет для ставки</CardTitle>
                        </CardHeader>
                        <CardContent className="py-2">
                          {!hasItems ? (
                            <p className="text-xs text-coral-500">
                              У вас нет предметов в инвентаре
                            </p>
                          ) : userInGame ? (
                            <p className="text-xs text-coral-500">
                              Вы уже участвуете в другой игре
                            </p>
                          ) : (
                            <ItemSelector 
                              inventoryItems={inventory?.items || []} 
                              onSelectItem={setSelectedItemId}
                              selectedItemId={selectedItemId}
                              compact={true}
                            />
                          )}
                        </CardContent>
                        <CardFooter className="py-2 flex justify-between">
                          <Button variant="outline" size="sm" onClick={() => {
                            setSelectedRoomId(null);
                            setSelectedItemId(null);
                            setJoinError(null);
                          }} className="bg-white/50 dark:bg-ocean-700/50 backdrop-blur-sm hover:bg-white/70 dark:hover:bg-ocean-600/70">
                            Отмена
                          </Button>
                          <Button 
                            size="sm"
                            onClick={handleJoinRoom}
                            disabled={!selectedItemId || userInGame}
                            className="coral-button"
                          >
                            Присоединиться
                          </Button>
                        </CardFooter>
                      </Card>
                    ) : (
                      <Button 
                        onClick={() => {
                          setSelectedRoomId(room.id);
                          setJoinError(null);
                        }} 
                        size="sm"
                        disabled={!hasItems || userInGame}
                        className="coral-button"
                      >
                        Присоединиться
                      </Button>
                    )
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default GameLobby;