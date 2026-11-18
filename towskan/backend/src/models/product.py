from datetime import datetime
from src.config.database import db


class Producto(db.Model):
    """Modelo relacional de Producto conforme al DER oficial del proyecto Towskan."""
    __tablename__ = "productos"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    categoria_id = db.Column(db.Integer, db.ForeignKey("categorias.id", onupdate="CASCADE", ondelete="RESTRICT"), nullable=False, index=True)
    nombre = db.Column(db.String(150), nullable=False)
    descripcion = db.Column(db.Text, nullable=True)
    precio = db.Column(db.Numeric(10, 2), nullable=False)
    imagen = db.Column(db.String(255), nullable=True)
    disponible = db.Column(db.Boolean, nullable=False, default=True)
    fecha_creacion = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    # Relaciones
    categoria = db.relationship("Categoria", back_populates="productos")
    detalles = db.relationship("DetallePedido", back_populates="producto", lazy="dynamic")

    def to_dict(self):
        """Retorna la representación del producto en diccionario."""
        return {
            "id": self.id,
            "categoria_id": self.categoria_id,
            "categoria_nombre": self.categoria.nombre_categoria if self.categoria else None,
            "nombre": self.nombre,
            "descripcion": self.descripcion,
            "precio": float(self.precio) if self.precio is not None else 0.0,
            "imagen": self.imagen,
            "disponible": bool(self.disponible),
            "fecha_creacion": self.fecha_creacion.isoformat() if self.fecha_creacion else None
        }

    def __repr__(self):
        return f"<Producto id={self.id} nombre='{self.nombre}' precio={self.precio} disponible={self.disponible}>"

