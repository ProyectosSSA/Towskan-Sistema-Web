import os
from flask import Flask, jsonify
from flask_cors import CORS
from flasgger import Swagger
from src.config.settings import Config
from src.config.database import init_db
from src.errors.handlers import register_error_handlers
from src.routes.auth_routes import auth_bp


def create_app():
    """Fábrica de aplicación Flask para el backend de Towskan."""
    app = Flask(__name__)
    app.config.from_object(Config)

    # Configuración de CORS
    CORS(app, resources={r"/api/*": {"origins": Config.CORS_ORIGINS}})

    # Configuración de Swagger / OpenAPI (RNF-10)
    swagger_config = {
        "headers": [],
        "specs": [
            {
                "endpoint": "apispec_1",
                "route": "/apispec_1.json",
                "rule_filter": lambda rule: True,
                "model_filter": lambda tag: True,
            }
        ],
        "static_url_path": "/flasgger_static",
        "swagger_ui": True,
        "specs_route": "/docs"
    }
    app.config["SWAGGER"] = {
        "title": "Towskan Web API",
        "uiversion": 3,
        "version": "1.0.0",
        "description": "API REST para el Sistema Web Interactivo y Gestión de Pedidos Towskan"
    }
    Swagger(app, config=swagger_config)

    # Inicializar Base de Datos (SQLAlchemy)
    init_db(app)

    # Registrar Manejadores Centralizados de Error (RNF-02, RNF-17)
    register_error_handlers(app)

    # Registrar Blueprints / Rutas
    app.register_blueprint(auth_bp)

    @app.route("/api/health", methods=["GET"])
    def health_check():
        return jsonify({
            "success": True,
            "status": "operational",
            "service": "Towskan Backend API",
            "version": "1.0.0"
        }), 200

    return app


app = create_app()

if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    debug = os.getenv("FLASK_ENV") == "development"
    app.run(host="0.0.0.0", port=port, debug=debug)
