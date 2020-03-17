from django.shortcuts import render
from django.http import HttpResponse
import PyPDF2
import requests
import camelot
import pandas as pd
import glob

def index(request):
    return render(request, 'tracker/index.html')

def downloadPDF(url, filename):
    """
    Download file from given {url} and store file in disk

    Parameters:
       url (String): URL of file to download
       filename (String): Name of the file to store in disk without .pdf extension
    """
    url = url
    r = requests.get(url, stream=True)

    with open(f'tracker/files/{filename}.pdf', 'wb') as f:
        f.write(r.content)

def getPagesNumber(filename):
    """
    Read PDF file and return number of pages
    """
    file = open(f'tracker/files/{filename}.pdf', 'rb')
    file_reader = PyPDF2.PdfFileReader(file)

    return file_reader.numPages;

def parsePDF(filename):
    """
    Read PDF file and then create a CSV equivalent

    Parameters:
       filename (String): Name of the file to read. Without extension.
    """
    print(f'Parsing file... {filename}')

    # Get path and number of pages
    n_pages = getPagesNumber(filename)
    file_path = f'tracker/files/{filename}.pdf'

    # Convert PDF to CSV
    tables = camelot.read_pdf(file_path, pages=f'1-{n_pages}')
    tables.export(f'tracker/files/{filename}.csv', f='csv', compress=False)

    # Merge generated CSV files into just one
    all_filenames = [i for i in glob.glob(f'tracker/files/{filename}*.csv')]
    combined_csv = pd.read_csv(all_filenames[0])

    for idx, f in enumerate(all_filenames):
        if idx > 0:
            df = pd.read_csv(f, header=None)
            df.columns = combined_csv.columns
            combined_csv = combined_csv.append(df)

    combined_csv.to_csv(f'tracker/files/final_{filename}.csv', index=False, encoding='utf-8-sig')

parsePDF('confirmed_cases')
