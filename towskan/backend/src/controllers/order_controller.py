import json
import time
from flask import request, jsonify, Response, current_app
from src.services.order_service import OrderService
from src.repositories.order_repository import OrderRepository
from src.models.user import Usuario


class OrderController:
    """Controlador HTTP para endpoints transaccionales y notificaciones de Pedidos."""

    @staticmethod
    def quote_order():
        """Calcula cotización en tiempo real de ítems sin persistir orden."""
        data = request.get_json(silent=True)
        if not data:
            return jsonify({
                "success": False,
                "error": "El cuerpo de la petición debe ser un objeto JSON válido."
            }), 400

        try:
            items = data.get("items", [])
            tipo_entrega = data.get("tipo_entrega", "domicilio")
            quote = OrderService.calculate_quote(items, tipo_entrega)
            return jsonify({
                "success": True,
                "data": {
                    "subtotal": float(quote["subtotal"]),
                    "impuestos": float(quote["impuestos"]),
                    "envio": float(quote["envio"]),
                    "total": float(quote["total"]),
                    "tipo_entrega": quote["tipo_entrega"]
                }
            }), 200
        except ValueError as err:
            return jsonify({
                "success": False,
                "error": str(err)
            }), 400
        except Exception as err:
            return jsonify({
                "success": False,
                "error": "Error interno al cotizar el pedido.",
                "details": str(err)
            }), 500

    @staticmethod
    def create_order(current_user: Usuario):
        """Crea un pedido transaccional para el usuario autenticado."""
        data = request.get_json(silent=True)
        if not data:
            return jsonify({
                "success": False,
                "error": "El cuerpo de la petición debe ser un objeto JSON válido."
            }), 400

        try:
            order = OrderService.create_order(current_user.id, data)
            return jsonify({
                "success": True,
                "message": "Pedido creado exitosamente.",
                "data": order
            }), 201
        except ValueError as err:
            return jsonify({
                "success": False,
                "error": str(err)
            }), 400
        except Exception as err:
            return jsonify({
                "success": False,
                "error": "Error interno al registrar el pedido.",
                "details": str(err)
            }), 500

    @staticmethod
    def get_my_orders(current_user: Usuario):
        """Obtiene todos los pedidos realizados por el usuario en sesión."""
        try:
            orders = OrderService.get_user_orders(current_user.id)
            return jsonify({
                "success": True,
                "count": len(orders),
                "data": orders
            }), 200
        except Exception as err:
            return jsonify({
                "success": False,
                "error": "Error interno al consultar sus pedidos.",
                "details": str(err)
            }), 500

    @staticmethod
    def get_order_by_id(current_user: Usuario, order_id: int):
        """Obtiene el detalle completo de un pedido específico."""
        try:
            order = OrderService.get_order_by_id(order_id, current_user.id)
            return jsonify({
                "success": True,
                "data": order
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
                "error": "Error interno al consultar el pedido.",
                "details": str(err)
            }), 500

    @staticmethod
    def get_all_orders(current_user: Usuario):
        """Lista general de pedidos para administración / cocina."""
        estado = request.args.get("estado")
        limit = request.args.get("limit", default=50, type=int)
        offset = request.args.get("offset", default=0, type=int)

        try:
            orders = OrderService.get_all_orders(estado=estado, limit=limit, offset=offset)
            return jsonify({
                "success": True,
                "count": len(orders),
                "data": orders
            }), 200
        except Exception as err:
            return jsonify({
                "success": False,
                "error": "Error interno al consultar los pedidos.",
                "details": str(err)
            }), 500

    @staticmethod
    def update_order_status(current_user: Usuario, order_id: int):
        """Actualiza el estado de preparación o entrega de un pedido."""
        data = request.get_json(silent=True)
        if not data or "estado" not in data:
            return jsonify({
                "success": False,
                "error": "Debe especificar el campo 'estado' en el cuerpo de la petición."
            }), 400

        nuevo_estado = data["estado"]
        try:
            updated = OrderService.update_order_status(order_id, nuevo_estado)
            return jsonify({
                "success": True,
                "message": f"Estado del pedido actualizado a '{nuevo_estado}'.",
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
                "error": "Error interno al actualizar el estado del pedido.",
                "details": str(err)
            }), 500

    @staticmethod
    def cancel_order(current_user: Usuario, order_id: int):
        """Cancela una orden si aún está pendiente."""
        data = request.get_json(silent=True) or {}
        razon = data.get("razon")
        try:
            cancelled = OrderService.cancel_order(order_id, current_user.id, razon=razon)
            return jsonify({
                "success": True,
                "message": f"Pedido #{order_id} cancelado con éxito.",
                "data": cancelled
            }), 200
        except ValueError as err:
            return jsonify({
                "success": False,
                "error": str(err)
            }), 400
        except PermissionError as err:
            return jsonify({
                "success": False,
                "error": str(err)
            }), 403
        except Exception as err:
            return jsonify({
                "success": False,
                "error": "Error interno al cancelar el pedido.",
                "details": str(err)
            }), 500

    @staticmethod
    def get_whatsapp_link(order_id: int):
        """Genera el mensaje y URL oficial para despacho vía WhatsApp."""
        try:
            wa_data = OrderService.generate_whatsapp_message(order_id)
            return jsonify({
                "success": True,
                "data": wa_data
            }), 200
        except ValueError as err:
            return jsonify({
                "success": False,
                "error": str(err)
            }), 404
        except Exception as err:
            return jsonify({
                "success": False,
                "error": "Error al generar enlace de WhatsApp.",
                "details": str(err)
            }), 500

    @staticmethod
    def get_receipt(order_id: int):
        """Genera comprobante / factura digital conforme a normas tributarias."""
        try:
            receipt = OrderService.generate_receipt(order_id)
            return jsonify({
                "success": True,
                "data": receipt
            }), 200
        except ValueError as err:
            return jsonify({
                "success": False,
                "error": str(err)
            }), 404
        except Exception as err:
            return jsonify({
                "success": False,
                "error": "Error al generar factura digital.",
                "details": str(err)
            }), 500

    @staticmethod
    def get_order_status(order_id: int):
        """Consulta liviana y rápida del estado operativo del pedido."""
        try:
            order = OrderRepository.get_by_id(order_id)
            if not order:
                return jsonify({
                    "success": False,
                    "error": f"Pedido con ID {order_id} no encontrado."
                }), 404

            return jsonify({
                "success": True,
                "data": {
                    "id": order.id,
                    "estado": order.estado,
                    "tipo_entrega": order.tipo_entrega,
                    "numero_mesa": order.numero_mesa,
                    "total": float(order.total)
                }
            }), 200
        except Exception as err:
            return jsonify({
                "success": False,
                "error": "Error al consultar estado del pedido.",
                "details": str(err)
            }), 500

    @staticmethod
    def stream_order_status(order_id: int):
        """Transmisión Server-Sent Events (SSE) para actualización reactiva en tiempo real."""
        app = current_app._get_current_object()

        def generate():
            last_status = None
            # Monitorear activamente durante hasta 40 ciclos (80 segundos por conexión)
            for _ in range(40):
                with app.app_context():
                    order = OrderRepository.get_by_id(order_id)
                    if not order:
                        yield f"event: error\ndata: {json.dumps({'error': 'Pedido no encontrado'})}\n\n"
                        break

                    if order.estado != last_status:
                        last_status = order.estado
                        payload = json.dumps({
                            "id": order.id,
                            "estado": order.estado,
                            "tipo_entrega": order.tipo_entrega,
                            "numero_mesa": order.numero_mesa,
                            "total": float(order.total)
                        })
                        yield f"event: status_change\ndata: {payload}\n\n"

                    # Si llega a estado final, enviar evento de completado
                    if order.estado in ("entregado", "cancelado"):
                        yield f"event: finished\ndata: {json.dumps({'id': order.id, 'estado': order.estado})}\n\n"
                        break

                time.sleep(2)

        return Response(
            generate(),
            mimetype="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "X-Accel-Buffering": "no"
            }
        )
