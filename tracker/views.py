from django.shortcuts import render
from django.http import HttpResponse
import PyPDF2
import requests
import camelot

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

def parsePDF():
    # Extract number of pages in PDF
    file_path = 'tracker/files/confirmed_cases.pdf'
    file = open('tracker/files/confirmed_cases.pdf', 'rb')
    file_reader = PyPDF2.PdfFileReader(file)

    # Parse PDF into several CSV files
    tables = camelot.read_pdf(file_path, pages=f'1-{file_reader.numPages}')
    tables.export('tracker/files/confirmed.csv', f='csv', compress=False, )
