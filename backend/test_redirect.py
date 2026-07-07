import urllib.request
from urllib.error import HTTPError

try:
    urllib.request.urlopen('http://localhost:3000/home')
except HTTPError as e:
    print('Error Code:', e.code)
    print('Final URL:', e.url)
