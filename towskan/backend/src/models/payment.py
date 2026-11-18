from datetime import datetime
from src.config.database import db


class Pago(db.Model):
    """Modelo relacional de Pago conforme al DER oficial del proyecto Towskan."""
    __tablename__ = "pagos"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    pedido_id = db.Column(db.Integer, db.ForeignKey("pedidos.id", onupdate="CASCADE", ondelete="CASCADE"), nullable=False, index=True)
    metodo = db.Column(
        db.Enum("efectivo", "nequi", "daviplata", "tarjeta", name="pago_metodo_enum"),
        nullable=False
    )
    proveedor = db.Column(db.String(50), nullable=True)
    estado = db.Column(
        db.Enum("pendiente", "aprobado", "rechazado", name="pago_estado_enum"),
        nullable=False,
        default="pendiente"
    )
    fecha_pago = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    # Relaciones
    pedido = db.relationship("Pedido", back_populates="pagos")

    def to_dict(self):
        """Retorna la representación del pago en diccionario."""
        return {
            "id": self.id,
            "pedido_id": self.pedido_id,
            "metodo": self.metodo,
            "proveedor": self.proveedor,
            "estado": self.estado,
            "fecha_pago": self.fecha_pago.isoformat() if self.fecha_pago else None
        }

    def __repr__(self):
        return f"<Pago id={self.id} pedido_id={self.pedido_id} metodo='{self.metodo}' estado='{self.estado}'>"

