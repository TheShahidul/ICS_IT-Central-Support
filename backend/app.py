"""
ICS - IT Central Support - Main Application Entry Point
"""
import os
from dotenv import load_dotenv
from app import create_app

# Load environment variables
load_dotenv()

# Create Flask app
app = create_app(os.getenv('FLASK_ENV', 'development'))

if __name__ == '__main__':
    app.run(
        host='127.0.0.1',
        port=5000,
        debug=app.config['DEBUG']
    )
