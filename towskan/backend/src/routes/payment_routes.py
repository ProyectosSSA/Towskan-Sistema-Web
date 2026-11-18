from flask import Blueprint
from src.controllers.payment_controller import PaymentController
from src.services.jwt_middleware import token_required

payment_bp = Blueprint("payments", __name__, url_prefix="/api/payments")

payment_bp.route("", methods=["POST"])(token_required(PaymentController.process_payment))
payment_bp.route("/order/<int:order_id>", methods=["GET"])(token_required(PaymentController.get_payment_by_order))
payment_bp.route("/<int:payment_id>/status", methods=["PATCH"])(token_required(PaymentController.update_payment_status))

