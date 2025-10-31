import pytest
from fastapi.testclient import TestClient
from src.app import app

client = TestClient(app)

def test_get_activities():
    response = client.get("/activities")
    assert response.status_code == 200
    data = response.json()
    assert "Chess Club" in data
    assert "Programming Class" in data

def test_signup_for_activity():
    email = "teststudent@mergington.edu"
    activity = "Chess Club"
    # Ensure not already signed up
    client.delete(f"/activities/{activity}/unregister", params={"email": email})
    response = client.post(f"/activities/{activity}/signup", params={"email": email})
    assert response.status_code == 200
    assert f"Signed up {email} for {activity}" in response.json()["message"]
    # Clean up
    client.delete(f"/activities/{activity}/unregister", params={"email": email})

def test_signup_duplicate():
    email = "teststudent2@mergington.edu"
    activity = "Programming Class"
    # Sign up first
    client.post(f"/activities/{activity}/signup", params={"email": email})
    # Try duplicate
    response = client.post(f"/activities/{activity}/signup", params={"email": email})
    assert response.status_code == 400
    assert "already signed up" in response.json()["detail"]
    # Clean up
    client.delete(f"/activities/{activity}/unregister", params={"email": email})

def test_unregister_from_activity():
    email = "teststudent3@mergington.edu"
    activity = "Gym Class"
    # Sign up first
    client.post(f"/activities/{activity}/signup", params={"email": email})
    response = client.delete(f"/activities/{activity}/unregister", params={"email": email})
    assert response.status_code == 200
    assert f"Unregistered {email} from {activity}" in response.json()["message"]

def test_unregister_not_registered():
    email = "notregistered@mergington.edu"
    activity = "Soccer Team"
    # Ensure not registered
    client.delete(f"/activities/{activity}/unregister", params={"email": email})
    response = client.delete(f"/activities/{activity}/unregister", params={"email": email})
    assert response.status_code == 400
    assert "not registered" in response.json()["detail"]
