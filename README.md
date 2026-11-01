# BTKJ × DRL — archiwum społeczności

Strona główna i interaktywna oś czasu w języku polskim. Pierwszy wpis opisuje początek społeczności: 25 marca 2021 roku na kanale crisuuubtkj na Twitchu.

## Uruchomienie

Wymagany Node.js 20 lub nowszy. Projekt nie wymaga instalowania pakietów.

```sh
npm run dev
```

Serwer domyślnie korzysta z portu 3000. Zmienna `PORT` pozwala go zmienić.

```sh
npm run check
```

Treści osi czasu znajdują się w `app.js`, treść strony w `index.html`, a wygląd w `style.css`. Filtry zawężają widoczne wspomnienia, a „O tym wspomnieniu” rozwija ich opisy. Układ dostosowuje się do telefonu. Czcionki Google są opcjonalne — bez połączenia strona używa czcionek systemowych.

Ta wersja jest publiczną stroną statyczną bez panelu administracyjnego, kont użytkowników i przesyłania materiałów.
