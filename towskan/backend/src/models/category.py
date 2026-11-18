from src.config.database import db


class Categoria(db.Model):
    """Modelo relacional de Categoría conforme al DER oficial del proyecto Towskan."""
    __tablename__ = "categorias"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    nombre_categoria = db.Column(db.String(100), nullable=False, unique=True)
    descripcion = db.Column(db.Text, nullable=True)

    # Relación 1:N con productos
    productos = db.relationship("Producto", back_populates="categoria", cascade="all, delete-orphan", lazy="select")

    def to_dict(self, include_product_count=True):
        """Retorna la representación de la categoría en diccionario."""
        data = {
            "id": self.id,
            "nombre_categoria": self.nombre_categoria,
            "descripcion": self.descripcion
        }
        if include_product_count:
            data["total_productos"] = len(self.productos) if self.productos else 0
        return data

    def __repr__(self):
        return f"<Categoria id={self.id} nombre='{self.nombre_categoria}'>"

