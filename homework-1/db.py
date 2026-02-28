import psycopg2
import psycopg2.extras
import os

DB_CONFIG = {
    "host": os.getenv("DB_HOST", "localhost"),
    "port": int(os.getenv("DB_PORT", 5432)),
    "database": os.getenv("DB_NAME", "university"),
    "user": os.getenv("DB_USER", "admin"),
    "password": os.getenv("DB_PASSWORD", "admin123")
}

def get_connection():
    try:
        connection = psycopg2.connect(**DB_CONFIG)
        return connection
    except Exception as e:
        print(f"Eroare la conectarea la baza de date: {e}")
        raise e

def execute_query(query, params=None, fetch=None):
    connection = None
    cursor = None
    try:
        connection = get_connection()
        cursor = connection.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

        cursor.execute(query, params)

        if fetch == "one":
            result = cursor.fetchone()
            return dict(result) if result else None

        elif fetch == "all":
            results = cursor.fetchall()
            return [dict(row) for row in results]

        else:
            connection.commit()
            try:
                result = cursor.fetchone()
                return dict(result) if result else None
            except:
                return None

    except Exception as e:
        if connection:
            connection.rollback()
        print(f"Eroare la executarea interogarii: {e}")
        raise e

    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()
