from flask import Blueprint
from src.controllers.order_controller import OrderController
from src.services.jwt_middleware import token_required

order_bp = Blueprint("orders", __name__, url_prefix="/api/orders")

# Cotizador público (para carrito reactivo)
order_bp.route("/quote", methods=["POST"])(OrderController.quote_order)

# Endpoints transaccionales del cliente autenticado
order_bp.route("", methods=["POST"])(token_required(OrderController.create_order))
order_bp.route("/my-orders", methods=["GET"])(token_required(OrderController.get_my_orders))
order_bp.route("/<int:order_id>", methods=["GET"])(token_required(OrderController.get_order_by_id))
order_bp.route("/<int:order_id>/cancel", methods=["POST"])(token_required(OrderController.cancel_order))

# Endpoints de gestión y cocina
order_bp.route("", methods=["GET"])(token_required(OrderController.get_all_orders))
order_bp.route("/<int:order_id>/status", methods=["PATCH"])(token_required(OrderController.update_order_status))

# Endpoints de Notificaciones y Comprobantes (Fase 4)
order_bp.route("/<int:order_id>/whatsapp", methods=["GET"])(OrderController.get_whatsapp_link)
order_bp.route("/<int:order_id>/receipt", methods=["GET"])(OrderController.get_receipt)

# Endpoints de Rastreo y Tiempo Real (Fase 4 - SSE & Polling)
order_bp.route("/<int:order_id>/status", methods=["GET"])(OrderController.get_order_status)
order_bp.route("/<int:order_id>/stream", methods=["GET"])(OrderController.stream_order_status)
