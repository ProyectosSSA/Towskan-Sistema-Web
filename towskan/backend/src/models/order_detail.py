from src.config.database import db


class DetallePedido(db.Model):
    """Modelo relacional de DetallePedido conforme al DER oficial del proyecto Towskan."""
    __tablename__ = "detalle_pedido"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    pedido_id = db.Column(db.Integer, db.ForeignKey("pedidos.id", onupdate="CASCADE", ondelete="CASCADE"), nullable=False, index=True)
    producto_id = db.Column(db.Integer, db.ForeignKey("productos.id", onupdate="CASCADE", ondelete="RESTRICT"), nullable=False, index=True)
    cantidad = db.Column(db.Integer, nullable=False, default=1)
    precio = db.Column(db.Numeric(10, 2), nullable=False)
    subtotal = db.Column(db.Numeric(10, 2), nullable=False)

    # Relaciones
    pedido = db.relationship("Pedido", back_populates="detalles")
    producto = db.relationship("Producto", back_populates="detalles")

    def to_dict(self):
        """Retorna la representación del detalle de pedido en diccionario."""
        return {
            "id": self.id,
            "pedido_id": self.pedido_id,
            "producto_id": self.producto_id,
            "producto_nombre": self.producto.nombre if self.producto else None,
            "producto_imagen": self.producto.imagen if self.producto else None,
            "cantidad": self.cantidad,
            "precio": float(self.precio) if self.precio is not None else 0.0,
            "subtotal": float(self.subtotal) if self.subtotal is not None else 0.0
        }

    def __repr__(self):
        return f"<DetallePedido id={self.id} pedido_id={self.pedido_id} producto_id={self.producto_id} subtotal={self.subtotal}>"

