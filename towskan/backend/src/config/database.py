from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()


def init_db(app):
    """Inicializa la extensión SQLAlchemy y crea las tablas si no existen."""
    db.init_app(app)
    with app.app_context():
        # Importar todos los modelos del DER para que SQLAlchemy cree las 6 tablas
        import src.models  # noqa: F401
        db.create_all()
