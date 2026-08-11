import pytest
from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

def test_api_health():
    res = client.get('/api/health')
    assert res.status_code == 200
    assert res.json()['status'] == 'healthy'

def test_api_models():
    res = client.get('/api/models')
    assert res.status_code == 200
    assert 'hardware' in res.json()
    assert len(res.json()['models']) >= 1

def test_api_wardrobe_list():
    res = client.get('/api/wardrobe')
    assert res.status_code == 200
    assert isinstance(res.json(), list)
