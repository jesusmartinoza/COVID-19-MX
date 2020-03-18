import PyPDF2
import requests
import camelot
import pandas as pd
import glob
import json
import os
import warnings
from tracker.models import State
from tracker.models import ConfirmedCase
from tracker.models import SuspectedCase
from datetime import datetime
from bs4 import BeautifulSoup

def downloadPDF(url, filename):
    """
    Download file from given {url} and store file in disk

    Arguments:
        url -- File to download
        filename -- Name of the file to store in disk without .pdf extension
    """
    url = url
    r = requests.get(url, stream=True, allow_redirects=False)
    success = r.status_code == requests.codes.ok

    if success:
        with open(f'tracker/files/{filename}.pdf', 'wb') as f:
            f.write(r.content)
    else:
        warnings.warn(f"********", FutureWarning)
        warnings.warn(f'{url} file not found', FutureWarning)

    return success

def getPagesNumber(filename):
    """
    Read PDF file and return number of pages

    Arguments:
        filename -- PDF to read without .pdf extension

    Return:
        Number of PDF pages
    """
    file = open(f'tracker/files/{filename}.pdf', 'rb')
    file_reader = PyPDF2.PdfFileReader(file)

    return file_reader.numPages;

def parsePDF(filename):
    """
    Read PDF file and then create a CSV equivalent

    Arguments:
        filename -- PDF to read without .pdf extension
    """
    print(f'Parsing file... {filename}')

    # Get path and number of pages
    n_pages = getPagesNumber(filename)
    file_path = f'tracker/files/{filename}.pdf'

    # Convert PDF to CSV
    tables = camelot.read_pdf(file_path, pages=f'1-{n_pages}')
    tables.export(f'tracker/files/{filename}.csv', f='csv', compress=False)

    # Merge generated CSV files into just one
    all_filenames = [i for i in sorted(glob.glob(f'tracker/files/{filename}*.csv'))]
    combined_csv = pd.read_csv(all_filenames[0])

    for idx, f in enumerate(all_filenames):
        if idx > 0:
            df = pd.read_csv(f, header=None)
            df.columns = combined_csv.columns
            combined_csv = combined_csv.append(df)

    combined_csv.to_csv(f'tracker/files/final_{filename}.csv', index=False, encoding='utf-8-sig')

def csvToDatabase(filename):
    """
    Read CSV file and store values in Sqlite Database
    Arguments:
        filename -- PDF to read without .pdf extension
    """
    df = pd.read_csv(f'tracker/files/final_{filename}.csv')
    api_keys = {}

    if os.path.exists('tracker/api_keys.json'):
        with open('tracker/api_keys.json') as json_file:
            api_keys = json.load(json_file)
    else:
        warnings.warn("You must create a jsonfile containing 'opencagedata' with your API KEY", FutureWarning)
        warnings.warn("Otherwise all States in DB will have 0,0 in coordinates", FutureWarning)

    for idx, row in df.iterrows():
        state_name = row[1].replace('*', '')
        state = State()

        # Get State from DB. If not possible then create a new register
        try:
            state = State.objects.filter(name=state_name)[0]
        except:
            api_key = api_keys['opencagedata']
            url = f'https://api.opencagedata.com/geocode/v1/json?q={state_name},MX&key={api_key}&no_annotations=1'
            r = requests.get(url)
            geo_result = r.json()
            geo_result = geo_result['results'][0]['geometry']
            state = State(name=state_name, latitude=geo_result['lat'], longitude=geo_result['lng'])
            state.save()

        if filename == 'suspected_cases':
            case = SuspectedCase(id=row[0],
                                 state_id=state,
                                 sex=(1 if row[2] == 'M' else 2),
                                 age=row[3],
                                 symptoms_date= datetime.strptime(row[4], '%d/%m/%Y').date(),
                                 origin_country=row[6],
                                )
            case.save()
        else:
            case = ConfirmedCase(id=row[0],
                                 state_id=state,
                                 sex=(1 if row[2] == 'M' else 2),
                                 age=row[3],
                                 symptoms_date= datetime.strptime(row[4], '%d/%m/%Y').date(),
                                 origin_country=row[6],
                                 healed=('*' in row[1]) # '*' indicates a healed case
                                )
            case.save()

def getPDFLinks():
    """
    Scrap https://www.gob.mx/ website to get last links of the thecnical documents.

    Return:
        Dictionary with PDF links of confirmed and positives cases
    """
    url = 'https://www.gob.mx/salud/documentos/nuevo-coronavirus-2019-ncov-comunicado-tecnico-diario?idiom=es'
    page = requests.get(url)
    soup = BeautifulSoup(page.content, 'html.parser')
    links = {}

    html_table = soup.find('div', class_='table-responsive')

    for a in html_table.find_all('a'):
        if 'positivos' in a['href']:
            links['confirmed_cases'] = 'https://www.gob.mx/' + a['href']
        elif 'sospechosos' in a['href']:
            links['suspected_cases'] = 'https://www.gob.mx/' + a['href']

    return links

def run():
    pdf_links = getPDFLinks()

    downloadPDF(url=pdf_links['confirmed_cases'],
                filename='confirmed_cases')
    parsePDF('confirmed_cases')
    csvToDatabase('confirmed_cases')

    downloadPDF(url=pdf_links['suspected_cases'],
                filename='suspected_cases')
    parsePDF('suspected_cases')
    csvToDatabase('suspected_cases')

