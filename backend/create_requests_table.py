import pymysql
from config import Config

def create_table():
    print(f"Connecting to database '{Config.DB_NAME}' on {Config.DB_HOST}:{Config.DB_PORT}...")
    try:
        params = Config.get_db_connection_params()
        params['cursorclass'] = pymysql.cursors.DictCursor
        conn = pymysql.connect(**params)
        with conn.cursor() as cursor:
            sql = """
            CREATE TABLE IF NOT EXISTS registration_requests (
                request_id INT AUTO_INCREMENT PRIMARY KEY,
                full_name VARCHAR(100) NOT NULL,
                email VARCHAR(100) NOT NULL UNIQUE,
                phone VARCHAR(10) NOT NULL,
                block VARCHAR(50) NOT NULL,
                flat_number VARCHAR(20) NOT NULL,
                flat_type VARCHAR(20) NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                status VARCHAR(20) NOT NULL DEFAULT 'Pending',
                submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
            """
            cursor.execute(sql)
            print("Table 'registration_requests' created successfully.")
        conn.close()
    except Exception as e:
        print(f"Failed to create table: {e}")
        raise e

if __name__ == "__main__":
    create_table()
