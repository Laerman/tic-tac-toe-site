import json
import csv
import io
import base64
import os
import psycopg2
from typing import List, Dict, Any

def handler(event: dict, context) -> dict:
    '''API для импорта товаров в базу данных из CSV или JSON'''
    method = event.get('httpMethod', 'POST')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            'body': ''
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    try:
        body = json.loads(event.get('body', '{}'))
        file_content = body.get('file_content', '')
        file_type = body.get('file_type', 'json')
        
        if not file_content:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'file_content is required'})
            }
        
        if file_type == 'csv':
            file_data = base64.b64decode(file_content).decode('utf-8')
            products = parse_csv(file_data)
        elif file_type == 'json':
            if file_content.startswith('data:'):
                file_data = base64.b64decode(file_content.split(',')[1]).decode('utf-8')
            else:
                file_data = file_content
            products = json.loads(file_data)
        else:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'file_type must be "csv" or "json"'})
            }
        
        if not isinstance(products, list):
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Products must be an array'})
            }
        
        imported_count = import_products_to_db(products)
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'success': True,
                'imported': imported_count,
                'total': len(products)
            })
        }
    
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)})
        }

def parse_csv(csv_content: str) -> List[Dict[str, Any]]:
    '''Парсинг CSV файла в список продуктов'''
    reader = csv.DictReader(io.StringIO(csv_content))
    products = []
    
    for row in reader:
        product = {}
        for key, value in row.items():
            if value == '' or value is None:
                product[key] = None
            elif key in ['in_stock', 'has_remote', 'is_dimmable', 'has_color_change', 'suspended_ceiling']:
                product[key] = value.lower() in ['true', '1', 'yes', 'да']
            elif key in ['price', 'rating', 'lighting_area', 'height', 'diameter', 'length', 'width', 'depth', 'chain_length']:
                product[key] = float(value) if value else None
            elif key in ['reviews', 'lamp_count', 'lamp_power', 'total_power', 'voltage', 'official_warranty', 'shop_warranty']:
                product[key] = int(value) if value else None
            elif key in ['images', 'materials']:
                product[key] = [x.strip() for x in value.split(',') if x.strip()] if value else []
            else:
                product[key] = value
        products.append(product)
    
    return products

def import_products_to_db(products: List[Dict[str, Any]]) -> int:
    '''Импорт продуктов в базу данных'''
    print(f"Starting import of {len(products)} products")
    
    dsn = os.environ.get('DATABASE_URL')
    conn = psycopg2.connect(dsn)
    cur = conn.cursor()
    
    imported = 0
    skipped = 0
    boolean_fields = ['in_stock', 'has_remote', 'is_dimmable', 'has_color_change', 'suspended_ceiling']
    numeric_fields = ['price', 'rating', 'reviews', 'lamp_count', 'lamp_power', 'total_power', 
                     'lighting_area', 'voltage', 'height', 'diameter', 'length', 'width', 
                     'depth', 'chain_length', 'official_warranty', 'shop_warranty']
    skip_fields = ['created_at', 'updated_at']
    
    for idx, product in enumerate(products):
        print(f"Processing product {idx + 1}: keys={list(product.keys())[:5]}")
        
        columns = []
        values = []
        placeholders = []
        
        for key, value in product.items():
            if key and key != 'id' and key.strip() and key not in skip_fields:
                clean_value = value
                
                if value == '' or value is None or value == 'NULL':
                    clean_value = None
                elif key in boolean_fields:
                    if isinstance(value, str):
                        clean_value = value.lower() in ['true', '1', 'yes', 'да', 'истина']
                    else:
                        clean_value = bool(value)
                elif key in numeric_fields:
                    try:
                        if '.' in str(value):
                            clean_value = float(value)
                        else:
                            clean_value = int(value)
                    except (ValueError, TypeError):
                        clean_value = None
                
                if key == 'name' and (not clean_value or clean_value == 'NULL'):
                    clean_value = 'Товар без названия'
                
                columns.append(f'"{key}"')
                values.append(clean_value)
                placeholders.append('%s')
        
        has_name = 'name' in [c.strip('"') for c in columns]
        print(f"Product {idx + 1}: columns={len(columns)}, has_name={has_name}")
        
        if columns and has_name:
            query = f"INSERT INTO products ({', '.join(columns)}) VALUES ({', '.join(placeholders)})"
            try:
                cur.execute(query, values)
                imported += 1
                print(f"Product {idx + 1}: imported successfully")
            except Exception as e:
                print(f"Product {idx + 1}: Error - {e}")
                skipped += 1
                continue
        else:
            print(f"Product {idx + 1}: skipped - no name field")
            skipped += 1
    
    conn.commit()
    cur.close()
    conn.close()
    
    print(f"Import complete: imported={imported}, skipped={skipped}")
    return imported