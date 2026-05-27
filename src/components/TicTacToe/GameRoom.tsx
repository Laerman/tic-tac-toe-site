import React from "react";
import { useGame } from "@/context/GameContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { formatDistanceToNow } from "date-fns";
import { ru } from "date-fns/locale";
import { Copy, Bot, Flame } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import Board from "./Board";
import UnderwaterIcon from "@/components/UnderwaterIcon";

const GameRoom: React.FC = () => {
  const { currentRoom, leaveRoom, makeMove, isSpectating } = useGame();
  const { user } = useAuth();
  const { toast } = useToast();
  
  if (!currentRoom) return null;
  
  // Находим текущего игрока
  const currentPlayer = currentRoom.players.find(p => p.username === user?.username);
  const opponentPlayer = currentRoom.players.find(p => p.username !== user?.username);
  
  // Определяем статус игры
  let gameStatus = "";
  
  if (currentRoom.status === "waiting") {
    gameStatus = "Ожидание второго игрока...";
  } else if (currentRoom.status === "playing") {
    if (currentRoom.winner) {
      gameStatus = `Победитель: ${currentRoom.winner}`;
    } else if (currentRoom.board.every(cell => cell !== null)) {
      gameStatus = "Ничья!";
    } else {
      const isMyTurn = currentRoom.players.some(p => 
        p.username === user?.username && p.id === currentRoom.currentTurn
      );
      
      if (isSpectating) {
        const currentPlayerTurn = currentRoom.players.find(p => p.id === currentRoom.currentTurn);
        gameStatus = `Ход игрока: ${currentPlayerTurn?.username || "Неизвестно"} (${currentPlayerTurn?.symbol || "?"})`;
      } else {
        gameStatus = isMyTurn ? "Ваш ход" : "Ход соперника";
      }
    }
  } else if (currentRoom.status === "finished") {
    if (currentRoom.winner) {
      if (isSpectating) {
        gameStatus = `Победитель: ${currentRoom.winner}`;
      } else {
        const hasPlayerWon = currentRoom.winner === user?.username;
        gameStatus = hasPlayerWon
          ? "Вы победили! 🏆" 
          : `Вы проиграли 😢 (победил ${currentRoom.winner})`;

        // Добавляем информацию о ставке
        if (!hasPlayerWon && currentPlayer) {
          gameStatus += " Ваша ставка сгорела! 🔥";
        }
      }
    } else {
      gameStatus = "Ничья!";
    }
  }

  const copyRoomCode = () => {
    navigator.clipboard.writeText(currentRoom.roomCode);
    toast({
      title: "Код скопирован",
      description: "Код комнаты скопирован в буфер обмена"
    });
  };

  return (
    <div className="space-y-6">
      <Card className="underwater-card overflow-hidden">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center">
                <UnderwaterIcon emoji="🎮" className="mr-2" />
                Подводная игра
              </CardTitle>
              <CardDescription>
                Создана {formatDistanceToNow(currentRoom.createdAt, { addSuffix: true, locale: ru })}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2 bg-purple-900/50 p-2 rounded border border-purple-700/40">
              <span className="text-sm font-medium">Код: {currentRoom.roomCode}</span>
              <Button variant="ghost" size="icon" onClick={copyRoomCode} className="h-6 w-6">
                <Copy className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pb-4">
          {isSpectating && (
            <div className="bg-amber-900/40 border border-amber-700/40 p-2 rounded mb-4 text-sm text-amber-300">
              <p className="font-medium">Режим наблюдения (только для администраторов)</p>
            </div>
          )}
          
          <div className="flex justify-between mb-4">
            <div>
              {currentRoom.players[0] && (
                <div className="flex items-center">
                  <div className="w-8 h-8 flex items-center justify-center rounded-full bg-ocean-700 text-ocean-200 mr-2">
                    {currentRoom.players[0].symbol}
                  </div>
                  <div>
                    <p className="font-medium">{currentRoom.players[0].username}</p>
                    <div className="flex items-center">
                      {currentRoom.players[0].isBot && (
                        <Bot className="mr-1 h-4 w-4 text-ocean-500" title="Бот" />
                      )}
                      {currentRoom.status === "playing" && (
                        <p className="text-xs text-muted-foreground">
                          {currentRoom.currentTurn === currentRoom.players[0].id ? "Сейчас ходит" : ""}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="text-right">
              {currentRoom.players[1] ? (
                <div className="flex items-center justify-end">
                  <div className="text-right">
                    <p className="font-medium">{currentRoom.players[1].username}</p>
                    <div className="flex items-center justify-end">
                      {currentRoom.status === "playing" && (
                        <p className="text-xs text-muted-foreground">
                          {currentRoom.currentTurn === currentRoom.players[1].id ? "Сейчас ходит" : ""}
                        </p>
                      )}
                      {currentRoom.players[1].isBot && (
                        <Bot className="ml-1 h-4 w-4 text-ocean-500" title="Бот" />
                      )}
                    </div>
                  </div>
                  <div className="w-8 h-8 flex items-center justify-center rounded-full bg-ocean-700 text-ocean-200 ml-2">
                    {currentRoom.players[1].symbol}
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-end">
                  <div>
                    <p className="text-sm text-muted-foreground">Ожидание второго игрока...</p>
                    <span className="text-xs bg-yellow-900/50 text-yellow-300 px-2 py-0.5 rounded-full border border-yellow-700/40">
                      Бот подключится через 1 минуту
                    </span>
                  </div>
                  <div className="w-8 h-8 flex items-center justify-center rounded-full bg-muted ml-2">
                    ?
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="text-center mb-4">
            <p className="text-xl font-bold">{gameStatus}</p>
            {currentRoom.status === "finished" && currentRoom.winner !== user?.username && !isSpectating && (
              <div className="mt-2 flex items-center justify-center gap-2 text-coral-500">
                <Flame className="h-5 w-5" />
                <p className="font-semibold">Ваш предмет сгорел и не будет возвращен!</p>
                <Flame className="h-5 w-5" />
              </div>
            )}
          </div>
          
          <div className="flex justify-center mb-4">
            <Board 
              squares={currentRoom.board} 
              onClick={(i) => {
                // Проверяем, можно ли сделать ход
                if (isSpectating) return; // В режиме наблюдения ходить нельзя
                
                const canMove = 
                  currentRoom.status === "playing" && 
                  currentRoom.currentTurn === currentPlayer?.id &&
                  currentRoom.board[i] === null;
                
                if (canMove) {
                  makeMove(i);
                }
              }} 
            />
          </div>
          
          <div className="text-sm text-muted-foreground">
            <p>ID комнаты: {currentRoom.id}</p>
            <p>Последняя активность: {formatDistanceToNow(currentRoom.lastActivity, { addSuffix: true, locale: ru })}</p>
            {currentRoom.players.some(p => p.isBot) && (
              <p className="mt-2 text-ocean-500 flex items-center">
                <Bot className="mr-1 h-4 w-4" /> 
                В этой комнате играет бот
              </p>
            )}
          </div>
          
          {/* Блок с информацией о ставках */}
          <div className="mt-4 p-3 bg-coral-50/70 dark:bg-coral-950/70 border border-coral-200 dark:border-coral-800 rounded-md">
            <h3 className="text-sm font-bold text-coral-700 dark:text-coral-400 flex items-center">
              <Flame className="h-4 w-4 mr-1" /> Правила игры на ставку:
            </h3>
            <ul className="list-disc list-inside text-xs text-coral-600 dark:text-coral-400 mt-1">
              <li>При выигрыше вы сохраняете свой предмет</li>
              <li>При проигрыше ваш предмет сгорает полностью</li>
              <li>При ничьей все предметы возвращаются владельцам</li>
              <li>Выход до завершения игры сохраняет ваш предмет</li>
            </ul>
          </div>
        </CardContent>
        
        <CardFooter>
          <Button onClick={leaveRoom} className="w-full" variant={isSpectating ? "outline" : "default"}>
            {isSpectating ? "Вернуться к списку комнат" : (currentRoom.status === "finished" ? "Вернуться в лобби" : "Покинуть игру")}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default GameRoom;