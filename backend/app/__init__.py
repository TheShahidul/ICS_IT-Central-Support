"""Flask application factory"""
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from config import get_config
import os

db = SQLAlchemy()

def create_app(config_name='development'):
    """Application factory pattern"""
    
    app = Flask(__name__)
    
    # Load configuration
    config_class = get_config(config_name)
    app.config.from_object(config_class)
    
    # Create instance folder if it doesn't exist (before initializing DB)
    try:
        os.makedirs(app.instance_path)
    except OSError:
        pass
    
    # Initialize extensions
    db.init_app(app)
    
    # Register error handlers
    @app.errorhandler(400)
    def bad_request(error):
        return {'error': 'Bad request'}, 400
    
    @app.errorhandler(404)
    def not_found(error):
        return {'error': 'Not found'}, 404
    
    @app.errorhandler(500)
    def server_error(error):
        return {'error': 'Internal server error'}, 500
    
    # Import models to ensure they're registered
    from app.models import Department, User, Ticket, TicketComment, Asset, AuditLog
    from app.routes.auth import auth_bp
    from app.routes.tickets import tickets_bp
    from app.routes.assets import assets_bp
    from app.routes.dashboard import dashboard_bp
    from app.routes.users import users_bp
    from app.routes.audit import audit_bp
    app.register_blueprint(auth_bp)
    app.register_blueprint(tickets_bp)
    app.register_blueprint(assets_bp)
    app.register_blueprint(dashboard_bp)
    app.register_blueprint(users_bp)
    app.register_blueprint(audit_bp)
    
    # Health check endpoint
    @app.route('/api/health', methods=['GET'])
    def health():
        return {'status': 'ok'}, 200
    
    # Create database tables on startup
    with app.app_context():
        try:
            db.create_all()
        except Exception as e:
            app.logger.error(f"Database initialization error: {e}")
    
    return app
