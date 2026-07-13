import os
import ssl
from dotenv import load_dotenv

# Load environment variables from .env if present
load_dotenv()

class Config:
    """Base Flask Configuration"""
    # Security keys
    SECRET_KEY = os.getenv('JWT_SECRET', 'dev-secret-key-12345-change-me-in-production')
    
    # Flask options
    DEBUG = os.getenv('FLASK_DEBUG', 'True').lower() in ('true', '1', 't', 'y', 'yes')
    PORT = int(os.getenv('PORT', 5000))
    
    # MySQL Database Configuration
    DB_HOST = os.getenv('DB_HOST', 'localhost')
    DB_USER = os.getenv('DB_USER', 'root')
    DB_PASSWORD = os.getenv('DB_PASSWORD', '')
    DB_NAME = os.getenv('DB_NAME', 'societyhub')
    DB_PORT = int(os.getenv('DB_PORT', 3307))
    DB_SSL = os.getenv('DB_SSL', 'False').lower() in ('true', '1', 't', 'y', 'yes')
    
    @staticmethod
    def get_db_connection_params():
        """Returns standard parameters for a PyMySQL connection"""
        params = {
            'host': Config.DB_HOST,
            'user': Config.DB_USER,
            'password': Config.DB_PASSWORD,
            'database': Config.DB_NAME,
            'port': Config.DB_PORT,
            'charset': 'utf8mb4',
            'autocommit': True
        }
        if Config.DB_SSL:
            ssl_context = ssl.create_default_context()
            ssl_context.check_hostname = False
            ssl_context.verify_mode = ssl.CERT_NONE
            params['ssl'] = ssl_context
        return params

