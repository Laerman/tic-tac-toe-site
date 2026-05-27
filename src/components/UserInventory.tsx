import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import Icon from '@/components/ui/icon';

interface InventoryItem {
  id: number;
  name: string;
  description?: string;
  type: string;
  rarity: string;
  icon: string;
  value: number;
  quantity: number;
  equipped: boolean;
  stackable: boolean;
  max_stack: number;
}

interface UserInventoryProps {
  userId: number;
}

const UserInventory: React.FC<UserInventoryProps> = ({ userId }) => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Загрузка инвентаря пользователя
  useEffect(() => {
    loadInventory();
  }, [userId]);

  const loadInventory = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Импортируем API функцию динамически
      const { getUserInventory } = await import('@/utils/inventoryAPI');
      const result = await getUserInventory(userId);
      
      if (result.success && result.data) {
        setInventory(result.data.inventory);
      } else {
        // Fallback на моковые данные если API недоступно
        console.warn('API недоступно, используем моковые данные');
        const mockInventory: InventoryItem[] = [
        {
          id: 1,
          name: 'Деревянный меч',
          description: 'Простой деревянный меч для начинающих воинов',
          type: 'weapon',
          rarity: 'common',
          icon: '🗡️',
          value: 10,
          quantity: 1,
          equipped: false,
          stackable: false,
          max_stack: 1
        },
        {
          id: 2,
          name: 'Золотая монета',
          description: 'Блестящая золотая монета',
          type: 'currency',
          rarity: 'common',
          icon: '🪙',
          value: 1,
          quantity: 100,
          equipped: false,
          stackable: true,
          max_stack: 999
        },
        {
          id: 3,
          name: 'Зелье здоровья',
          description: 'Восстанавливает 50 очков здоровья',
          type: 'consumable',
          rarity: 'common',
          icon: '🧪',
          value: 25,
          quantity: 3,
          equipped: false,
          stackable: true,
          max_stack: 10
        },
        {
          id: 4,
          name: 'Хлеб',
          description: 'Питательный хлеб, восстанавливает голод',
          type: 'consumable',
          rarity: 'common',
          icon: '🍞',
          value: 5,
          quantity: 5,
          equipped: false,
          stackable: true,
          max_stack: 20
        }
        ];
        setInventory(mockInventory);
        setError(result.error || 'Используются демо-данные');
      }
    } catch (err) {
      setError('Не удалось загрузить инвентарь');
      console.error('Ошибка загрузки инвентаря:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-muted text-muted-foreground border-border';
      case 'uncommon': return 'bg-green-900/50 text-green-300 border-green-700';
      case 'rare': return 'bg-blue-900/50 text-blue-300 border-blue-700';
      case 'epic': return 'bg-purple-900/50 text-purple-300 border-purple-700';
      case 'legendary': return 'bg-amber-900/50 text-amber-300 border-amber-700';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'weapon': return 'Sword';
      case 'armor': return 'Shield';
      case 'consumable': return 'Flask';
      case 'currency': return 'Coins';
      case 'misc': return 'Package';
      case 'tool': return 'Wrench';
      default: return 'Package';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'weapon': return 'Оружие';
      case 'armor': return 'Броня';
      case 'consumable': return 'Расходник';
      case 'currency': return 'Валюта';
      case 'misc': return 'Разное';
      case 'tool': return 'Инструмент';
      default: return 'Предмет';
    }
  };

  const getRarityLabel = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'Обычный';
      case 'uncommon': return 'Необычный';
      case 'rare': return 'Редкий';
      case 'epic': return 'Эпический';
      case 'legendary': return 'Легендарный';
      default: return 'Неизвестно';
    }
  };

  const getTotalValue = () => {
    return inventory.reduce((total, item) => total + (item.value * item.quantity), 0);
  };

  const getItemsByType = () => {
    const grouped = inventory.reduce((groups, item) => {
      if (!groups[item.type]) {
        groups[item.type] = [];
      }
      groups[item.type].push(item);
      return groups;
    }, {} as Record<string, InventoryItem[]>);

    return grouped;
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Icon name="Loader2" size={24} className="animate-spin mr-2" />
          <span>Загрузка инвентаря...</span>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <Icon name="AlertCircle" size={48} className="mx-auto mb-4 text-red-500" />
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={loadInventory} variant="outline">
            Попробовать снова
          </Button>
        </CardContent>
      </Card>
    );
  }

  const groupedItems = getItemsByType();

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl flex items-center gap-2">
              <Icon name="Package" size={24} />
              Инвентарь
            </CardTitle>
            <CardDescription>
              {inventory.length} предметов • Общая стоимость: {getTotalValue()} 🪙
            </CardDescription>
          </div>
          <Button onClick={loadInventory} variant="outline" size="sm">
            <Icon name="RefreshCw" size={16} className="mr-1" />
            Обновить
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {Object.keys(groupedItems).length === 0 ? (
          <div className="text-center py-8">
            <Icon name="Package" size={48} className="mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Инвентарь пуст</p>
          </div>
        ) : (
          Object.entries(groupedItems).map(([type, items]) => (
            <div key={type} className="space-y-3">
              <div className="flex items-center gap-2">
                <Icon name={getTypeIcon(type)} size={18} />
                <h3 className="font-semibold text-lg">{getTypeLabel(type)}</h3>
                <Badge variant="secondary">{items.length}</Badge>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{item.icon}</span>
                        <div>
                          <h4 className="font-medium text-sm">{item.name}</h4>
                          <p className="text-xs text-muted-foreground line-clamp-2">{item.description}</p>
                        </div>
                      </div>
                      {item.equipped && (
                        <Badge variant="secondary" className="text-xs">
                          Экипирован
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${getRarityColor(item.rarity)}`}
                        >
                          {getRarityLabel(item.rarity)}
                        </Badge>
                        {item.quantity > 1 && (
                          <Badge variant="secondary" className="text-xs">
                            ×{item.quantity}
                          </Badge>
                        )}
                      </div>
                      <span className="text-gray-500">
                        {item.value * item.quantity} 🪙
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {type !== Object.keys(groupedItems)[Object.keys(groupedItems).length - 1] && (
                <Separator />
              )}
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};

export default UserInventory;