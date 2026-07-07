import urllib.request

routes = ['/', '/home', '/assistant', '/appointments', '/doctors', '/timeline', '/labs', '/benefits', '/family', '/emergency', '/profile']

for route in routes:
    try:
        req = urllib.request.urlopen(f'http://localhost:3000{route}')
        print(f'{route}: {req.getcode()} -> {req.geturl()}')
    except Exception as e:
        print(f'{route}: ERROR {e}')
