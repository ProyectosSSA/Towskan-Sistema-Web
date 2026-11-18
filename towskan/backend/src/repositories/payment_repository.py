from src.config.database import db
from src.models.payment import Pago


class PaymentRepository:
    """Capa de Repositorio para la persistencia y consultas de Pagos."""

    @staticmethod
    def get_by_id(payment_id: int) -> Pago | None:
        """Busca un registro de pago por su clave primaria."""
        return db.session.get(Pago, payment_id)

    @staticmethod
    def get_by_order_id(order_id: int) -> list[Pago]:
        """Obtiene todas las transacciones de pago asociadas a un pedido."""
        return Pago.query.filter_by(pedido_id=order_id).order_by(Pago.fecha_pago.asc()).all()

    @staticmethod
    def create(pedido_id: int, metodo: str, proveedor: str | None = None, estado: str = "pendiente") -> Pago:
        """Crea y persiste un nuevo registro de transacción de pago."""
        pago = Pago(
            pedido_id=pedido_id,
            metodo=metodo,
            proveedor=proveedor,
            estado=estado
        )
        db.session.add(pago)
        db.session.commit()
        return pago

    @staticmethod
    def update_status(pago: Pago, nuevo_estado: str) -> Pago:
        """Actualiza el estado de la transacción de pago."""
        pago.estado = nuevo_estado
        db.session.commit()
        return pago

