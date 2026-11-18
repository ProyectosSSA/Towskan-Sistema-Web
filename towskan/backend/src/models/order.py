from datetime import datetime
from src.config.database import db


class Pedido(db.Model):
    """Modelo relacional de Pedido conforme al DER oficial del proyecto Towskan."""
    __tablename__ = "pedidos"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    usuario_id = db.Column(db.Integer, db.ForeignKey("usuarios.id", onupdate="CASCADE", ondelete="RESTRICT"), nullable=False, index=True)
    subtotal = db.Column(db.Numeric(10, 2), nullable=False, default=0.00)
    impuestos = db.Column(db.Numeric(10, 2), nullable=False, default=0.00)  # 8% Impuesto Nacional al Consumo
    envio = db.Column(db.Numeric(10, 2), nullable=False, default=0.00)      # Costo de domicilio
    total = db.Column(db.Numeric(10, 2), nullable=False, default=0.00)
    estado = db.Column(
        db.Enum("pendiente", "preparando", "en camino", "entregado", "cancelado", name="pedido_estado_enum"),
        nullable=False,
        default="pendiente",
        index=True
    )
    tipo_entrega = db.Column(
        db.Enum("domicilio", "para llevar", "en mesa", name="tipo_entrega_enum"),
        nullable=False,
        default="domicilio"
    )
    numero_mesa = db.Column(db.String(10), nullable=True)
    fecha_pedido = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    # Relaciones
    usuario = db.relationship("Usuario", back_populates="pedidos")
    detalles = db.relationship("DetallePedido", back_populates="pedido", cascade="all, delete-orphan", lazy="select")
    pagos = db.relationship("Pago", back_populates="pedido", cascade="all, delete-orphan", lazy="select")

    def to_dict(self, include_relations=True):
        """Retorna la representación del pedido en diccionario."""
        data = {
            "id": self.id,
            "usuario_id": self.usuario_id,
            "usuario_nombre": self.usuario.nombre if self.usuario else None,
            "usuario_email": self.usuario.email if self.usuario else None,
            "subtotal": float(self.subtotal) if self.subtotal is not None else 0.0,
            "impuestos": float(self.impuestos) if self.impuestos is not None else 0.0,
            "envio": float(self.envio) if self.envio is not None else 0.0,
            "total": float(self.total) if self.total is not None else 0.0,
            "estado": self.estado,
            "tipo_entrega": self.tipo_entrega,
            "numero_mesa": self.numero_mesa,
            "fecha_pedido": self.fecha_pedido.isoformat() if self.fecha_pedido else None
        }
        if include_relations:
            data["detalles"] = [d.to_dict() for d in self.detalles] if self.detalles else []
            data["pagos"] = [p.to_dict() for p in self.pagos] if self.pagos else []
        return data

    def __repr__(self):
        return f"<Pedido id={self.id} usuario_id={self.usuario_id} total={self.total} estado='{self.estado}'>"

