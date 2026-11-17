from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()


def init_db(app):
    """Inicializa la extensión SQLAlchemy y crea las tablas si no existen."""
    db.init_app(app)
    with app.app_context():
        # Importar modelos para que SQLAlchemy los reconozca en metadata
        from src.models import user
        db.create_all()
