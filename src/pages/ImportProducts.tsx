import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import Icon from "@/components/ui/icon";

export default function ImportProducts() {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{ imported: number; total: number } | null>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      const fileType = selectedFile.name.toLowerCase();
      if (fileType.endsWith('.json') || fileType.endsWith('.csv')) {
        setFile(selectedFile);
        setResult(null);
      } else {
        toast({
          title: "Неверный формат",
          description: "Поддерживаются только JSON и CSV файлы",
          variant: "destructive"
        });
      }
    }
  };

  const handleImport = async () => {
    if (!file) {
      toast({
        title: "Ошибка",
        description: "Выберите файл для импорта",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      const fileType = file.name.toLowerCase().endsWith('.csv') ? 'csv' : 'json';
      const reader = new FileReader();

      reader.onload = async (e) => {
        const content = e.target?.result as string;
        let products = [];

        if (fileType === 'csv') {
          const lines = content.split('\n');
          const headers = lines[0].split(',').map(h => h.trim());
          
          for (let i = 1; i < lines.length; i++) {
            if (lines[i].trim()) {
              const values = lines[i].split(',');
              const product: any = {};
              headers.forEach((header, idx) => {
                product[header] = values[idx]?.trim() || null;
              });
              products.push(product);
            }
          }
        } else {
          products = JSON.parse(content);
        }

        if (!Array.isArray(products)) {
          throw new Error('Файл должен содержать массив товаров');
        }

        const BATCH_SIZE = 50;
        let totalImported = 0;

        for (let i = 0; i < products.length; i += BATCH_SIZE) {
          const batch = products.slice(i, i + BATCH_SIZE);
          
          const response = await fetch('https://functions.poehali.dev/fdd2f94b-a941-4339-ab97-b129904f06be', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              file_type: 'json',
              file_content: JSON.stringify(batch)
            })
          });

          const data = await response.json();

          if (response.ok && data.success) {
            totalImported += data.imported;
          } else {
            throw new Error(data.error || 'Ошибка импорта');
          }
        }

        setResult({ imported: totalImported, total: products.length });
        toast({
          title: "Успешно!",
          description: `Импортировано ${totalImported} из ${products.length} товаров`,
        });
        setFile(null);
        const input = document.getElementById('file-input') as HTMLInputElement;
        if (input) input.value = '';
      };

      reader.onerror = () => {
        throw new Error('Ошибка чтения файла');
      };

      reader.readAsText(file);
    } catch (error) {
      toast({
        title: "Ошибка импорта",
        description: error instanceof Error ? error.message : 'Неизвестная ошибка',
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="Upload" size={24} />
              Импорт товаров
            </CardTitle>
            <CardDescription>
              Загрузите JSON или CSV файл с товарами для добавления в базу данных
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <label htmlFor="file-input" className="block cursor-pointer">
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:border-muted-foreground/50 transition-colors">
                  <Icon name="FileUp" size={48} className="mx-auto mb-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground block">
                    Нажмите для выбора файла или перетащите его сюда
                  </span>
                  <input
                    id="file-input"
                    type="file"
                    accept=".json,.csv"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  {file && (
                    <div className="mt-4 flex items-center justify-center gap-2 text-sm">
                      <Icon name="File" size={16} />
                      <span className="font-medium">{file.name}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.preventDefault();
                          setFile(null);
                          const input = document.getElementById('file-input') as HTMLInputElement;
                          if (input) input.value = '';
                        }}
                      >
                        <Icon name="X" size={16} />
                      </Button>
                    </div>
                  )}
                </div>
              </label>

              <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                <h3 className="font-semibold text-sm flex items-center gap-2">
                  <Icon name="Info" size={16} />
                  Формат данных
                </h3>
                <div className="text-xs text-muted-foreground space-y-1">
                  <p><strong>JSON:</strong> массив объектов с полями товаров</p>
                  <p><strong>CSV:</strong> первая строка - названия столбцов, далее - данные</p>
                  <p className="mt-2">Поддерживаемые поля: name, description, price, brand, type, image_url, in_stock и др.</p>
                </div>
              </div>

              <Button
                onClick={handleImport}
                disabled={!file || isLoading}
                className="w-full"
                size="lg"
              >
                {isLoading ? (
                  <>
                    <Icon name="Loader2" size={20} className="mr-2 animate-spin" />
                    Импортируем...
                  </>
                ) : (
                  <>
                    <Icon name="Upload" size={20} className="mr-2" />
                    Импортировать товары
                  </>
                )}
              </Button>
            </div>

            {result && (
              <Card className="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <Icon name="CheckCircle2" size={24} className="text-green-600 dark:text-green-400 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-green-900 dark:text-green-100">
                        Импорт завершен
                      </h4>
                      <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                        Успешно добавлено <strong>{result.imported}</strong> товаров из <strong>{result.total}</strong>
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}