# Collection Probe — Full Universe

המסמך הזה צמוד לקוד שהוא מתאר:

`fetch-all-securities.js`

זהו probe מחקרי, לא collector production.

## מטרה

להוכיח שאפשר לקבל את כל universe ולבצע validation מלא.

ה-flow:

~~~text
MapHeat2
→ recordCount
→ all PaperIds
→ split to batches
→ GetSecuritiesData
→ validate received / unique / missing / duplicates
~~~

## תוצאות מאומתות

### MapHeat2

~~~text
pageCount=50
recordCount: 561
records received: 50

pageCount=561
recordCount: 561
records received: 561
~~~

### GetSecuritiesData — request size

~~~text
100 IDs → HTTP 200 → 100
187 IDs → HTTP 200 → 187
200 IDs → HTTP 200 → 200
250 IDs → HTTP 200 → 250
400 IDs → HTTP 403
561 IDs → HTTP 403
~~~

לא הוכח אם ה-403 נובע ממספר IDs, מאורך URL, מכלל אבטחה, ממגבלת backend או משילוב שלהם.

### Full universe

~~~text
561 IDs
→ 187 + 187 + 187

Request 1: HTTP 200 → 187
Request 2: HTTP 200 → 187
Request 3: HTTP 200 → 187

Requested: 561
Received: 561
Unique: 561
Duplicates: 0
Missing: 0
~~~

## מסקנה

הנתיב המוכח כרגע הוא batching שמרני של 187 IDs, sequential.

המספר 561 אינו contract; קוד production עתידי צריך לקרוא `recordCount` דינמית.

## איך מריצים

מריצים את הסקריפט מתוך DevTools Console באותו origin/session של אתר לאומי.

אין לשמור cookies, tokens או authorization data ב-repository.
