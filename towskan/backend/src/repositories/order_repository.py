from src.config.database import db
from src.models.order import Pedido
from src.models.order_detail import DetallePedido
from src.models.payment import Pago


class OrderRepository:
    """Capa de Repositorio para la persistencia transaccional de Pedidos y Detalles."""

    @staticmethod
    def get_all(usuario_id: int | None = None, estado: str | None = None, limit: int = 50, offset: int = 0) -> list[Pedido]:
        """Obtiene la lista de pedidos con filtros opcionales."""
        query = Pedido.query

        if usuario_id is not None:
            query = query.filter(Pedido.usuario_id == usuario_id)

        if estado:
            query = query.filter(Pedido.estado == estado.strip().lower())

        return query.order_by(Pedido.fecha_pedido.desc()).limit(limit).offset(offset).all()

    @staticmethod
    def get_by_id(order_id: int) -> Pedido | None:
        """Busca un pedido por su identificador primario con detalles y pagos cargados."""
        return db.session.get(Pedido, order_id)

    @staticmethod
    def create_atomic(pedido: Pedido, detalles: list[DetallePedido], pago: Pago | None = None) -> Pedido:
        """Persiste atómicamente el pedido, sus detalles y el pago asociado en una única transacción."""
        try:
            db.session.add(pedido)
            db.session.flush()  # Obtiene el ID autogenerado del pedido sin hacer commit

            for detalle in detalles:
                detalle.pedido_id = pedido.id
                db.session.add(detalle)

            if pago:
                pago.pedido_id = pedido.id
                db.session.add(pago)

            db.session.commit()
            return pedido
        except Exception:
            db.session.rollback()
            raise

    @staticmethod
    def update_status(pedido: Pedido, nuevo_estado: str) -> Pedido:
        """Actualiza el estado operativo del pedido."""
        pedido.estado = nuevo_estado
        db.session.commit()
        return pedido

    @staticmethod
    def save(pedido: Pedido) -> Pedido:
        """Guarda cualquier cambio realizado en la entidad Pedido."""
        db.session.add(pedido)
        db.session.commit()
        return pedido

