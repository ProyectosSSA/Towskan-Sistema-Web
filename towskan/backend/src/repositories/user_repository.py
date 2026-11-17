from src.config.database import db
from src.models.user import Usuario


class UserRepository:
    """Capa de Repositorio para la persistencia y consultas de Usuario."""

    @staticmethod
    def get_by_id(user_id: int) -> Usuario | None:
        return db.session.get(Usuario, user_id)

    @staticmethod
    def get_by_email(email: str) -> Usuario | None:
        return Usuario.query.filter_by(email=email.strip().lower()).first()

    @staticmethod
    def get_by_google_id(google_id: str) -> Usuario | None:
        return Usuario.query.filter_by(google_id=google_id).first()

    @staticmethod
    def create(nombre: str, email: str, password_hash: str | None = None, proveedor: str = "local", google_id: str | None = None) -> Usuario:
        nuevo_usuario = Usuario(
            nombre=nombre.strip(),
            email=email.strip().lower(),
            password=password_hash,
            proveedor=proveedor,
            google_id=google_id
        )
        db.session.add(nuevo_usuario)
        db.session.commit()
        return nuevo_usuario

    @staticmethod
    def save(usuario: Usuario) -> Usuario:
        db.session.add(usuario)
        db.session.commit()
        return usuario
