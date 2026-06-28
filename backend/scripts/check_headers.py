import pandas as pd
import urllib.request
import io

URLS = [
    "https://docs.google.com/spreadsheets/d/1wzpm_7pd0fC4hFou5FzppMNeZkd6J6NvrPqy-PWNvRY/export?format=csv",
    "https://docs.google.com/spreadsheets/d/1EQ-_ENQUhtLaTdZtyhLZuSJZ7WG4RUuyc7ipGc7emhM/export?format=csv&gid=717213385",
    "https://docs.google.com/spreadsheets/d/1qp8auzPK5d_hH5cPpTBhlKOpVDNeO0SiXT-aJmTE3ek/export?format=csv&gid=1503366664",
    "https://docs.google.com/spreadsheets/d/1WpmBGPv74EDZxI-Q7YWVAMTO60Kcozg4aRr5tzLTVjs/export?format=csv&gid=0",
    "https://docs.google.com/spreadsheets/d/1Nl6YeTjYQUNrdFsq88hhuq5SCxFIP5TfimOkhslEKE8/export?format=csv&gid=0",
    "https://docs.google.com/spreadsheets/d/1k0Nwl7Hk2b5ZQNwYfjtkHOKm_4v2ZkVakj5qlcsggeM/export?format=csv&gid=0",
    "https://docs.google.com/spreadsheets/d/15rPT2geAQLirrpCKN8a4YruE5SuyIOl21BSSMJ9cGR4/export?format=csv&gid=16072054",
    "https://docs.google.com/spreadsheets/d/1VUxxtjBXhBptsdz4hoj-Su1rt1ve_hEu8S4xJb_lu-E/export?format=csv&gid=1811788722",
    "https://drive.google.com/uc?export=download&id=1l8ZU8BJva6dCSMALF3nacH4c9tr9VPQF",
    "https://drive.google.com/uc?export=download&id=15gUXyoBjsZK8RlixGotv635uY4t1m5Wu",
    "https://drive.google.com/uc?export=download&id=1FPDaQY7RKk5HkyjFTE63MH1lBHymxRMg"
]

for url in URLS:
    try:
        if "export=download" in url:
            df = pd.read_excel(url, nrows=2)
        else:
            df = pd.read_csv(url, nrows=2)
        print(f"URL: {url.split('/')[-1]}")
        print("Columnas:", df.columns.tolist())
    except Exception as e:
        print(f"Error {url}: {e}")
