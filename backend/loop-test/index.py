import json
import time


def handler(event: dict, context) -> dict:
    """Тестовая функция: крутится в цикле заданное число секунд (по умолчанию 3, максимум 4) и возвращает число итераций."""
    if event.get('httpMethod') == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id, X-Auth-Token, X-Session-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }

    params = event.get('queryStringParameters') or {}
    try:
        seconds = float(params.get('seconds', 3))
    except ValueError:
        seconds = 3.0
    seconds = max(0.1, min(seconds, 4.0))

    started = time.time()
    iterations = 0
    while time.time() - started < seconds:
        iterations += 1

    return {
        'statusCode': 200,
        'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
        'body': json.dumps({
            'status': 'done',
            'seconds': round(time.time() - started, 2),
            'iterations': iterations
        })
    }
