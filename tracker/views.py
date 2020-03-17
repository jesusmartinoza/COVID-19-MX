from django.shortcuts import render
from django.http import HttpResponse
import requests

def index(request):
    return render(request, 'tracker/index.html')

def downloadFile(url, filename):
    """
    Download file from given {url} and store file in disk

    Parameters:
       url (String): URL of file to download
       filename (String): Name of the file to store in disk
    """
    url = url
    r = requests.get(url, stream=True)

    with open(f'tracker/files/{filename}', 'wb') as f:
        f.write(r.content)

