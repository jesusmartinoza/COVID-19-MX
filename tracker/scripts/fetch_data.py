import PyPDF2
import requests
import camelot
import pandas as pd
import glob
from tracker.models import State
from tracker.models import ConfirmedCase
from tracker.models import SuspectedCase
from datetime import datetime

def downloadPDF(url, filename):
    """
    Download file from given {url} and store file in disk

    Arguments:
        url -- File to download
        filename -- Name of the file to store in disk without .pdf extension
    """
    url = url
    r = requests.get(url, stream=True)

    with open(f'tracker/files/{filename}.pdf', 'wb') as f:
        f.write(r.content)

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
    all_filenames = [i for i in glob.glob(f'tracker/files/{filename}*.csv')]
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

    for idx, row in df.iterrows():
        state_name = row[1].replace('*', '')
        state = State()

        try:
            state = State.objects.filter(name=state_name)[0]
        except:
            state = State(name=state_name, latitude=0, longitude=0) # TODO: Fetch latitude from somewhere. Now they are edited manually in /admin D;
            state.save()
            pass

        case = ConfirmedCase(id=row[0],
                             state_id=state,
                             sex=(1 if row[2] == 'M' else 2),
                             age=row[3],
                             symptoms_date= datetime.strptime(row[4], '%d/%m/%Y').date(),
                             origin_country=row[6],
                             healed=('*' in row[1]) # '*' indicates a healed case
                            )
        case.save()

def run():
    parsePDF('confirmed_cases')
    csvToDatabase('confirmed_cases')
