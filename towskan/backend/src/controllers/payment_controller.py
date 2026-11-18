from flask import request, jsonify
from src.services.payment_service import PaymentService
from src.models.user import Usuario


class PaymentController:
    """Controlador HTTP para endpoints de Transacciones de Pago."""

    @staticmethod
    def process_payment(current_user: Usuario):
        """Registra un pago para un pedido específico (requiere autenticación)."""
        data = request.get_json(silent=True)
        if not data:
            return jsonify({
                "success": False,
                "error": "El cuerpo de la petición debe ser un objeto JSON válido."
            }), 400

        order_id = data.get("pedido_id")
        if not order_id:
            return jsonify({
                "success": False,
                "error": "El campo 'pedido_id' es obligatorio."
            }), 400

        try:
            order_id = int(order_id)
        except (ValueError, TypeError):
            return jsonify({
                "success": False,
                "error": "El campo 'pedido_id' debe ser un número entero."
            }), 400

        try:
            pago = PaymentService.register_payment(order_id, data, current_user.id)
            return jsonify({
                "success": True,
                "message": "Pago registrado exitosamente.",
                "data": pago
            }), 201
        except ValueError as err:
            status_code = 404 if "no encontrado" in str(err) else 400
            return jsonify({
                "success": False,
                "error": str(err)
            }), status_code
        except PermissionError as err:
            return jsonify({
                "success": False,
                "error": str(err)
            }), 403
        except Exception as err:
            return jsonify({
                "success": False,
                "error": "Error interno al procesar el pago.",
                "details": str(err)
            }), 500

    @staticmethod
    def get_payment_by_order(current_user: Usuario, order_id: int):
        """Obtiene el historial de pagos de un pedido."""
        try:
            pagos = PaymentService.get_payments_by_order(order_id, current_user.id)
            return jsonify({
                "success": True,
                "count": len(pagos),
                "data": pagos
            }), 200
        except ValueError as err:
            return jsonify({
                "success": False,
                "error": str(err)
            }), 404
        except PermissionError as err:
            return jsonify({
                "success": False,
                "error": str(err)
            }), 403
        except Exception as err:
            return jsonify({
                "success": False,
                "error": "Error interno al consultar los pagos.",
                "details": str(err)
            }), 500

    @staticmethod
    def update_payment_status(current_user: Usuario, payment_id: int):
        """Actualiza el estado de una transacción de pago."""
        data = request.get_json(silent=True)
        if not data or "estado" not in data:
            return jsonify({
                "success": False,
                "error": "Debe especificar el campo 'estado' en el cuerpo de la petición."
            }), 400

        nuevo_estado = data["estado"]
        try:
            updated = PaymentService.update_payment_status(payment_id, nuevo_estado)
            return jsonify({
                "success": True,
                "message": f"Estado del pago actualizado a '{nuevo_estado}'.",
                "data": updated
            }), 200
        except ValueError as err:
            status_code = 404 if "no encontrado" in str(err) else 400
            return jsonify({
                "success": False,
                "error": str(err)
            }), status_code
        except Exception as err:
            return jsonify({
                "success": False,
                "error": "Error interno al actualizar el estado del pago.",
                "details": str(err)
            }), 500

