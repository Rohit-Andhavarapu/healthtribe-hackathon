import urllib.request
import urllib.error
import json

token = "eyJhbGciOiJSUzI1NiIsImNhdCI6ImNsX0I3ZDRQRDExMUFBQSIsImtpZCI6Imluc18zRzNDcHcwaFhFM3JnbVpLOXprN2p2V2N1RmYiLCJvaWF0IjoxNzgzMTkzMTgxLCJ0eXAiOiJKV1QifQ.eyJhenAiOiJodHRwOi8vbG9jYWxob3N0OjMwMDAiLCJleHAiOjE3ODMxOTMyNDEsImZ2YSI6WzIsLTFdLCJpYXQiOjE3ODMxOTMxODEsImlzcyI6Imh0dHBzOi8vbGlnaHQtc3dpbmUtMjEuY2xlcmsuYWNjb3VudHMuZGV2IiwibmJmIjoxNzgzMTkzMTcxLCJzaWQiOiJzZXNzXzNHM0dzbDNwRElHM1lkOGg0aHI0NkdLNXRoSSIsInN0cyI6ImFjdGl2ZSIsInN1YiI6InVzZXJfM0czR2swMmJUNXN3Q0tubG8yVVFXMmpWR3FQIiwidiI6Mn0.BbKQZk8KXT_8NDkCNuV7t1lZHpf0EtEUztxsLxKnSQV3SxOQebeEHqaUjP8b6M1Ei1ishTPA3L9DguZuqEMLL5p_3-RtUgS7cKCZEfxOZgicEXjGBjd0EtTwIdzfGaxQIp0zRqMY7O8ffa3iuV0bGUH50uy-iUhNLFSCDXgy3ZYb0_sPV0u8cI_I3zOFDTDZ3XLeDUoh8-vf6WXyWaM-dCYzM2kvmkqRFeLmATRqOF8lnS6Mg6_v2wxnKe8WaE8E0S62XOBKzuzAGVJzuGglHm07zAust-jIeDAAHb4eyjQ47ucpWnU_ayFeJqGokttiDDf00FgMZXSS7Vi6xvnOvw"

req = urllib.request.Request(
    'http://127.0.0.1:8000/api/v1/ai/chat/stream',
    data=json.dumps({"messages": [{"role": "user", "content": "hello"}]}).encode(),
    headers={"Content-Type": "application/json", "Authorization": f"Bearer {token}"}
)

try:
    with urllib.request.urlopen(req) as response:
        while True:
            chunk = response.read(10)
            if not chunk:
                print("\nEOF")
                break
            print(chunk.decode(), end='', flush=True)
except Exception as e:
    print(e)
