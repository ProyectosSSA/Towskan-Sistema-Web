from datetime import datetime
from src.config.database import db


class Usuario(db.Model):
    """Modelo relacional de Usuario conforme al DER oficial del proyecto Towskan."""
    __tablename__ = "usuarios"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    nombre = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(150), unique=True, nullable=False, index=True)
    password = db.Column(db.String(250), nullable=True)  # Nullable si se autentica con Google
    proveedor = db.Column(db.Enum("local", "google", name="proveedor_auth_enum"), nullable=False, default="local")
    google_id = db.Column(db.String(255), nullable=True, unique=True)
    fecha_registro = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    # Relación 1:N con pedidos
    pedidos = db.relationship("Pedido", back_populates="usuario", lazy="dynamic", cascade="all, delete-orphan")

    def to_dict(self):
        """Retorna la representación en diccionario sanitizada (sin password)."""
        return {
            "id": self.id,
            "nombre": self.nombre,
            "email": self.email,
            "proveedor": self.proveedor,
            "google_id": self.google_id,
            "fecha_registro": self.fecha_registro.isoformat() if self.fecha_registro else None
        }

    def __repr__(self):
        return f"<Usuario id={self.id} email='{self.email}' proveedor='{self.proveedor}'>"
