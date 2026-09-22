# בדיקות מאומתות — 2026-09-22

מסמך זה מכיל רק תוצאות שנצפו בפועל.

## MapHeat2

### pageCount=50

~~~text
recordCount: 561
records received: 50
~~~

### pageCount=561

~~~text
recordCount: 561
records received: 561
~~~

מסקנה: בזמן הבדיקה ניתן היה לקבל את כל 561 רשומות MapHeat2 בקריאה אחת.

## GetSecuritiesData

### 100 IDs

~~~text
HTTP status: 200
Securities received: 100
~~~

### 200 IDs

~~~text
HTTP status: 200
Securities received: 200
~~~

### 250 IDs

~~~text
HTTP status: 200
Securities received: 250
~~~

### 400 IDs

~~~text
HTTP status: 403
~~~

### 561 IDs

~~~text
Request URL length: 4419
HTTP status: 403
~~~

לא הוכח האם ה-403 נובע ממספר ה-IDs, מאורך ה-URL, מכלל אבטחה אחר, או משילוב ביניהם.

## 3 × 187

~~~text
recordCount: 561
records received: 561
PaperIds: 561

Chunk sizes:
[187, 187, 187]

Request 1 HTTP status: 200
Request 1 received: 187

Request 2 HTTP status: 200
Request 2 received: 187

Request 3 HTTP status: 200
Request 3 received: 187

Requested total: 561
Received total: 561
Unique securities: 561
Duplicates: 0
Missing: 0

SUCCESS: received all 561 securities
~~~

זהו הנתיב המוכח כרגע לקבלת כל הנתונים.
