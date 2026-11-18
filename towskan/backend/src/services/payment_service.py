from src.repositories.payment_repository import PaymentRepository
from src.repositories.order_repository import OrderRepository
from src.models.payment import Pago


METODOS_PAGO_VALIDOS = ("efectivo", "nequi", "daviplata", "tarjeta")
ESTADOS_PAGO_VALIDOS = ("pendiente", "aprobado", "rechazado")


class PaymentService:
    """Capa de Servicios de Negocio para la Gestión y Registro de Transacciones de Pago."""

    @staticmethod
    def register_payment(order_id: int, data: dict, current_user_id: int | None = None) -> dict:
        """Registra un nuevo intento o confirmación de pago para un pedido."""
        pedido = OrderRepository.get_by_id(order_id)
        if not pedido:
            raise ValueError(f"Pedido con ID {order_id} no encontrado.")

        if current_user_id is not None and pedido.usuario_id != current_user_id:
            raise PermissionError("No tiene autorización para registrar pagos en este pedido.")

        if pedido.estado == "cancelado":
            raise ValueError("No se pueden registrar pagos para un pedido que ha sido cancelado.")

        metodo = data.get("metodo")
        if not metodo or not isinstance(metodo, str):
            raise ValueError("El campo 'metodo' es obligatorio.")
        metodo_clean = metodo.strip().lower()
        if metodo_clean not in METODOS_PAGO_VALIDOS:
            raise ValueError(f"Método de pago '{metodo}' no reconocido. Opciones: {', '.join(METODOS_PAGO_VALIDOS)}.")

        proveedor = data.get("proveedor", metodo_clean)
        estado = data.get("estado", "pendiente")
        estado_clean = str(estado).strip().lower()
        if estado_clean not in ESTADOS_PAGO_VALIDOS:
            raise ValueError(f"Estado de pago '{estado}' no válido. Opciones: {', '.join(ESTADOS_PAGO_VALIDOS)}.")

        nuevo_pago = PaymentRepository.create(
            pedido_id=order_id,
            metodo=metodo_clean,
            proveedor=str(proveedor).strip() if proveedor else None,
            estado=estado_clean
        )

        # Regla de negocio: Si el pago es aprobado y el pedido estaba pendiente, avanza a preparación
        if estado_clean == "aprobado" and pedido.estado == "pendiente":
            OrderRepository.update_status(pedido, "preparando")

        return nuevo_pago.to_dict()

    @staticmethod
    def update_payment_status(payment_id: int, nuevo_estado: str) -> dict:
        """Actualiza el estado de una transacción de pago."""
        pago = PaymentRepository.get_by_id(payment_id)
        if not pago:
            raise ValueError(f"Registro de pago con ID {payment_id} no encontrado.")

        nuevo_estado_clean = nuevo_estado.strip().lower()
        if nuevo_estado_clean not in ESTADOS_PAGO_VALIDOS:
            raise ValueError(f"Estado de pago '{nuevo_estado}' no válido. Opciones: {', '.join(ESTADOS_PAGO_VALIDOS)}.")

        updated = PaymentRepository.update_status(pago, nuevo_estado_clean)

        # Si se aprueba, sincronizar con el pedido
        if nuevo_estado_clean == "aprobado":
            pedido = OrderRepository.get_by_id(pago.pedido_id)
            if pedido and pedido.estado == "pendiente":
                OrderRepository.update_status(pedido, "preparando")

        return updated.to_dict()

    @staticmethod
    def get_payments_by_order(order_id: int, current_user_id: int | None = None) -> list[dict]:
        """Obtiene las transacciones de pago vinculadas a un pedido."""
        pedido = OrderRepository.get_by_id(order_id)
        if not pedido:
            raise ValueError(f"Pedido con ID {order_id} no encontrado.")

        if current_user_id is not None and pedido.usuario_id != current_user_id:
            raise PermissionError("No tiene autorización para consultar los pagos de este pedido.")

        pagos = PaymentRepository.get_by_order_id(order_id)
        return [p.to_dict() for p in pagos]

