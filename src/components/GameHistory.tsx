import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface GameParticipant {
  user_id: number;
  login: string;
  position: number | null;
  joined_at: string;
  player_data: any;
}

interface GameBet {
  user_id: number;
  login: string;
  bet_amount: number;
  item_value: number;
  status: 'active' | 'won' | 'lost' | 'returned';
  placed_at: string;
  item_name: string;
  item_icon: string;
}

interface Game {
  id: string;
  game_type: string;
  status: 'active' | 'finished' | 'cancelled';
  winner_id: number | null;
  winner_login: string | null;
  total_pot_value: number;
  game_data: any;
  started_at: string;
  finished_at: string | null;
  participants: GameParticipant[];
  bets: GameBet[];
}

interface GameHistoryProps {
  userId?: number;
  limit?: number;
}

const GameHistory: React.FC<GameHistoryProps> = ({ userId, limit = 20 }) => {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Демо-данные для отображения пока backend недоступен
  const demoGames: Game[] = [
    {
      id: '1',
      game_type: 'poker',
      status: 'finished',
      winner_id: 1,
      winner_login: 'test_user',
      total_pot_value: 1500,
      game_data: { rounds: 3, final_hand: 'royal_flush', duration_minutes: 45 },
      started_at: '2024-09-15T14:30:00Z',
      finished_at: '2024-09-15T15:15:00Z',
      participants: [
        {
          user_id: 1,
          login: 'test_user',
          position: 1,
          joined_at: '2024-09-15T14:30:00Z',
          player_data: { cards: ['AS', 'KS'], final_bet: 500 }
        }
      ],
      bets: [
        {
          user_id: 1,
          login: 'test_user',
          bet_amount: 1,
          item_value: 500,
          status: 'won',
          placed_at: '2024-09-15T14:30:00Z',
          item_name: 'Меч Драконоборца',
          item_icon: '⚔️'
        }
      ]
    },
    {
      id: '2',
      game_type: 'blackjack',
      status: 'finished',
      winner_id: 1,
      winner_login: 'test_user',
      total_pot_value: 800,
      game_data: { dealer_score: 19, player_score: 21, cards_dealt: 12 },
      started_at: '2024-09-16T10:20:00Z',
      finished_at: '2024-09-16T10:35:00Z',
      participants: [
        {
          user_id: 1,
          login: 'test_user',
          position: 1,
          joined_at: '2024-09-16T10:20:00Z',
          player_data: { cards: ['AH', '10S'], score: 21 }
        }
      ],
      bets: [
        {
          user_id: 1,
          login: 'test_user',
          bet_amount: 1,
          item_value: 300,
          status: 'won',
          placed_at: '2024-09-16T10:20:00Z',
          item_name: 'Щит Стража',
          item_icon: '🛡️'
        }
      ]
    },
    {
      id: '3',
      game_type: 'roulette',
      status: 'active',
      winner_id: null,
      winner_login: null,
      total_pot_value: 600,
      game_data: { current_round: 1, pot_size: 600 },
      started_at: '2024-09-18T12:00:00Z',
      finished_at: null,
      participants: [
        {
          user_id: 1,
          login: 'test_user',
          position: null,
          joined_at: '2024-09-18T12:00:00Z',
          player_data: { bet_type: 'red', bet_amount: 600 }
        }
      ],
      bets: [
        {
          user_id: 1,
          login: 'test_user',
          bet_amount: 1,
          item_value: 600,
          status: 'active',
          placed_at: '2024-09-18T12:00:00Z',
          item_name: 'Зелье Здоровья',
          item_icon: '🧪'
        }
      ]
    }
  ];

  const loadGames = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // В будущем здесь будет реальный API запрос
      // const response = await fetch(`/api/game-history${userId ? `?user_id=${userId}` : ''}`)
      
      // Пока используем демо-данные
      await new Promise(resolve => setTimeout(resolve, 500)); // Имитация загрузки
      
      let filteredGames = demoGames;
      if (userId) {
        filteredGames = demoGames.filter(game => 
          game.participants.some(p => p.user_id === userId)
        );
      }
      
      setGames(filteredGames.slice(0, limit));
      
    } catch (err) {
      setError('Ошибка загрузки истории игр');
      console.error('Error loading games:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGames();
  }, [userId, limit]);

  const getGameTypeIcon = (gameType: string) => {
    switch (gameType) {
      case 'poker': return '🎰';
      case 'blackjack': return '🃏';
      case 'roulette': return '🎲';
      default: return '🎮';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'finished': return 'secondary';
      case 'active': return 'default';
      case 'cancelled': return 'destructive';
      default: return 'secondary';
    }
  };

  const getBetStatusColor = (status: string) => {
    switch (status) {
      case 'won': return 'bg-green-900/50 text-green-300 border-green-700';
      case 'lost': return 'bg-red-900/50 text-red-300 border-red-700';
      case 'active': return 'bg-blue-900/50 text-blue-300 border-blue-700';
      case 'returned': return 'bg-yellow-900/50 text-yellow-300 border-yellow-700';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatGameType = (gameType: string) => {
    switch (gameType) {
      case 'poker': return 'Покер';
      case 'blackjack': return 'Блэкджек';
      case 'roulette': return 'Рулетка';
      default: return gameType;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <Icon name="Loader2" size={24} className="animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">Загрузка истории игр...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <Icon name="AlertCircle" size={24} className="text-red-500 mx-auto mb-2" />
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={loadGames} variant="outline">
              <Icon name="RefreshCw" size={16} className="mr-2" />
              Попробовать снова
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Icon name="History" size={20} />
            История игр
            {userId && <Badge variant="outline">Мои игры</Badge>}
          </CardTitle>
          <Button onClick={loadGames} variant="outline" size="sm">
            <Icon name="RefreshCw" size={16} className="mr-2" />
            Обновить
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {games.length === 0 ? (
          <div className="text-center py-8">
            <Icon name="GamepadIcon" size={48} className="text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Игры не найдены</p>
          </div>
        ) : (
          <div className="space-y-4">
            {games.map((game) => (
              <Card key={game.id} className="border-l-4 border-l-blue-500">
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{getGameTypeIcon(game.game_type)}</span>
                      <div>
                        <h3 className="font-semibold text-lg">
                          {formatGameType(game.game_type)}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(game.started_at)}
                          {game.finished_at && ` - ${formatDate(game.finished_at)}`}
                        </p>
                      </div>
                    </div>
                    <Badge variant={getStatusColor(game.status)}>
                      {game.status === 'finished' ? 'Завершена' : 
                       game.status === 'active' ? 'Активная' : 'Отменена'}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-sm text-gray-600">Банк</p>
                      <p className="font-semibold text-yellow-600">
                        {game.total_pot_value} 🪙
                      </p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-sm text-gray-600">Участники</p>
                      <p className="font-semibold">{game.participants.length}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-sm text-gray-600">Победитель</p>
                      <p className="font-semibold">
                        {game.winner_login || 'Не определен'}
                      </p>
                    </div>
                  </div>

                  {game.bets.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Ставки:</h4>
                      <div className="space-y-2">
                        {game.bets.map((bet, index) => (
                          <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                            <div className="flex items-center gap-2">
                              <span>{bet.item_icon}</span>
                              <span className="font-medium">{bet.item_name}</span>
                              <span className="text-sm text-gray-600">x{bet.bet_amount}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-600">{bet.item_value} 🪙</span>
                              <Badge className={getBetStatusColor(bet.status)}>
                                {bet.status === 'won' ? 'Выиграл' :
                                 bet.status === 'lost' ? 'Проиграл' :
                                 bet.status === 'active' ? 'Активная' : 'Возвращена'}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default GameHistory;