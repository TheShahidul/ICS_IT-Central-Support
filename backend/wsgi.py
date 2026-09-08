"""
Production WSGI Entrypoint for ICS - IT Central Support
Configured with Werkzeug ProxyFix for reverse-proxy and HTTPS environments (Render, Fly.io, Railway, Nginx).
"""
import os
from werkzeug.middleware.proxy_fix import ProxyFix
from app import create_app

# Create app in production mode by default
env = os.getenv('FLASK_ENV', 'production')
app = create_app(env)

# Apply ProxyFix so Flask recognizes https:// and client IP forwarded by reverse proxy
app.wsgi_app = ProxyFix(
    app.wsgi_app,
    x_for=1,
    x_proto=1,
    x_host=1,
    x_port=1,
    x_prefix=1
)

if __name__ == '__main__':
    # Local production testing (Waitress or Flask)
    port = int(os.getenv('PORT', 5000))
    app.run(host='0.0.0.0', port=port)
