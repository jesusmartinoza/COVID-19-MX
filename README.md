# COVID-19-MX 🦠 📈
Dashboard to show the last Coronavirus data in *México*. This repository contains the process of data mining from official sources, cleaning the data and store it in a Relational Database to finally show it in a human-readable way.

![](https://overflow.ai/static/tracker/images/coronavirus_dashboard_mexico.png)

## Requirements
This project is built with Django 3.0 and uses the following libraries:
 - `beautifulsoup4`: Library for extract PDF links from Government website.
 - `camelot-py`: **Super** powerful tool to parse PDF to CSV.
 - `pandas`: Auxilary library to handle CSV in an easy way.
 - `requests`: Library to make HTTP requests.

 All the libraries are found in the `requirements.txt` file and can be install using the command `pip install -r requirements.txt`. It's recommended to use a Virtual Environment when installing new libraries.

## Data source
Data extracted from [Mexican Government Daily Technical Report](https://www.gob.mx/salud/documentos/nuevo-coronavirus-2019-ncov-comunicado-tecnico-diario?idiom=es).

##### Data processing
All the data mining is found in the file
`scripts/fetch_data.py`. It contains all the functions to web scrap, download, parse and store in Sqlite3.

It can be run using Django Extensions:
```
python3 manage.py runscript fetch_data -v2
```

## Frontend
The frontend relies in lightweight and open sources libraries:
- [Openlayers](https://github.com/openlayers/openlayers): Library to manage all related with the map. Rendering, clustering, gestures, etc.
- [Fluidable](https://fluidable.com/): Simple and lightweight grid system. Bootstrap is simply too much for this project.
- [Apexcharts.js](https://github.com/apexcharts/apexcharts.js): Amazing charts thanks to them.

## Useful commands
- `python3 manage.py flush`: Sometimes Django keeps a DB cache that can make the data extracting a little messy. This commands helps to delete cache.
- `python3 manage.py migrate`: To apply DB schema changes.

## Future work
- The main task I want to do is to show data according to days. This requires a lot of manual work since the data source doesn't contain cases per day.
- Chart of cases per age. This is easy since the data is already in the Database.
- More ideas in the [Issues](https://github.com/jesusmartinoza/COVID-19-MX/issues) section.

## Open Source
Feel free fork and change the code to your requirements. Feedback is always welcome and of course PR too. 🙈