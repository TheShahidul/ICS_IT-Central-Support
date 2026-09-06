import os
from datetime import timedelta

class Config:
    """Base configuration"""
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ECHO = False
    SESSION_COOKIE_SECURE = False  # Set True in production
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = 'Lax'
    PERMANENT_SESSION_LIFETIME = timedelta(hours=1)
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')

class DevelopmentConfig(Config):
    """Development configuration"""
    DEBUG = True
    TESTING = False
    # Use absolute path for Windows compatibility
    BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    INSTANCE_PATH = os.path.join(BASE_DIR, 'backend', 'instance')
    os.makedirs(INSTANCE_PATH, exist_ok=True)
    DB_PATH = os.path.join(INSTANCE_PATH, 'it_support.db')
    SQLALCHEMY_DATABASE_URI = f'sqlite:///{DB_PATH}'
    SQLALCHEMY_ECHO = True

class TestingConfig(Config):
    """Testing configuration"""
    DEBUG = True
    TESTING = True
    SQLALCHEMY_DATABASE_URI = 'sqlite:///:memory:'
    WTF_CSRF_ENABLED = False

class ProductionConfig(Config):
    """Production configuration"""
    DEBUG = False
    TESTING = False
    SESSION_COOKIE_SECURE = True
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL', 'sqlite:///it_support.db')

def get_config(config_name=None):
    env = config_name or os.getenv('FLASK_ENV', 'development')
    if env == 'testing':
        return TestingConfig
    elif env == 'production':
        return ProductionConfig
    return DevelopmentConfig
