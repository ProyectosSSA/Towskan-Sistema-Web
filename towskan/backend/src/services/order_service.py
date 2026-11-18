from decimal import Decimal, ROUND_HALF_UP
import urllib.parse
from datetime import datetime
from src.config.settings import Config
from src.repositories.order_repository import OrderRepository
from src.repositories.product_repository import ProductRepository
from src.repositories.payment_repository import PaymentRepository
from src.models.order import Pedido
from src.models.order_detail import DetallePedido
from src.models.payment import Pago


# Constantes de negocio
TARIFA_DOMICILIO_COP = Decimal("5000.00")
TASA_IMPUESTO_CONSUMO = Decimal("0.08")  # 8% Impuesto Nacional al Consumo en Colombia
TIPOS_ENTREGA_VALIDOS = ("domicilio", "para llevar", "en mesa")
METODOS_PAGO_VALIDOS = ("efectivo", "nequi", "daviplata", "tarjeta")
ESTADOS_PEDIDO_VALIDOS = ("pendiente", "preparando", "en camino", "entregado", "cancelado")


class OrderService:
    """Capa de Servicios de Negocio para el Procesamiento Atómico de Pedidos y Notificaciones."""

    @staticmethod
    def calculate_quote(items_data: list[dict], tipo_entrega: str) -> dict:
        """Calcula cotización financiera de un carrito con subtotales, impuestos y envío."""
        if not items_data or not isinstance(items_data, list):
            raise ValueError("El pedido debe contener al menos un producto en la lista 'items'.")

        total_unidades = sum(int(item.get("cantidad", 1)) for item in items_data if isinstance(item, dict))
        if total_unidades > 50:
            raise ValueError("Por políticas del restaurante, una sola orden no puede superar las 50 unidades. Para catering comuníquese a soporte.")

        tipo_entrega_clean = tipo_entrega.strip().lower() if tipo_entrega else "domicilio"
        if tipo_entrega_clean not in TIPOS_ENTREGA_VALIDOS:
            raise ValueError(f"Modalidad de entrega '{tipo_entrega}' inválida. Debe ser: {', '.join(TIPOS_ENTREGA_VALIDOS)}.")

        subtotal_acumulado = Decimal("0.00")
        desglose_items = []

        for item in items_data:
            prod_id = item.get("producto_id")
            if not prod_id:
                raise ValueError("Cada ítem debe incluir 'producto_id'.")
            try:
                prod_id = int(prod_id)
            except (ValueError, TypeError):
                raise ValueError("El campo 'producto_id' debe ser un número entero.")

            cantidad = item.get("cantidad", 1)
            try:
                cantidad = int(cantidad)
                if cantidad <= 0:
                    raise ValueError(f"La cantidad para el producto ID {prod_id} debe ser mayor a 0.")
            except (ValueError, TypeError):
                raise ValueError(f"La cantidad para el producto ID {prod_id} debe ser un entero válido.")

            producto = ProductRepository.get_by_id(prod_id)
            if not producto:
                raise ValueError(f"El producto con ID {prod_id} no existe en el catálogo.")

            if not producto.disponible:
                raise ValueError(f"El producto '{producto.nombre}' no se encuentra disponible actualmente.")

            precio_unitario = Decimal(str(producto.precio))
            subtotal_item = (precio_unitario * cantidad).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
            subtotal_acumulado += subtotal_item

            desglose_items.append({
                "producto": producto,
                "producto_id": producto.id,
                "cantidad": cantidad,
                "precio": precio_unitario,
                "subtotal": subtotal_item
            })

        # Regla de monto mínimo para domicilios
        if tipo_entrega_clean == "domicilio" and subtotal_acumulado < Decimal(str(Config.MONTO_MINIMO_DOMICILIO)):
            raise ValueError(
                f"El pedido mínimo para entrega a domicilio es de ${Config.MONTO_MINIMO_DOMICILIO:,.0f} COP (subtotal actual: ${subtotal_acumulado:,.0f} COP)."
            )

        if subtotal_acumulado > Decimal(str(Config.MONTO_MAXIMO_PEDIDO)):
            raise ValueError(
                f"El monto de la orden supera el límite máximo permitido de ${Config.MONTO_MAXIMO_PEDIDO:,.0f} COP."
            )

        impuestos = (subtotal_acumulado * TASA_IMPUESTO_CONSUMO).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
        costo_envio = TARIFA_DOMICILIO_COP if tipo_entrega_clean == "domicilio" else Decimal("0.00")
        total = (subtotal_acumulado + impuestos + costo_envio).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)

        return {
            "subtotal": subtotal_acumulado,
            "impuestos": impuestos,
            "envio": costo_envio,
            "total": total,
            "tipo_entrega": tipo_entrega_clean,
            "desglose_items": desglose_items
        }

    @classmethod
    def create_order(cls, usuario_id: int, data: dict) -> dict:
        """Crea atómicamente un nuevo pedido con sus detalles y pago inicial."""
        items_data = data.get("items")
        tipo_entrega = data.get("tipo_entrega", "domicilio")
        numero_mesa = data.get("numero_mesa")

        # Validaciones de entrega en mesa
        tipo_entrega_clean = tipo_entrega.strip().lower() if isinstance(tipo_entrega, str) else "domicilio"
        if tipo_entrega_clean == "en mesa":
            if not numero_mesa or not str(numero_mesa).strip():
                raise ValueError("Para la modalidad 'en mesa' es obligatorio especificar el número de mesa.")
            numero_mesa = str(numero_mesa).strip()
        else:
            numero_mesa = None

        # Cotización y validación matemática de productos
        quote = cls.calculate_quote(items_data, tipo_entrega_clean)

        # Crear entidad Pedido
        pedido = Pedido(
            usuario_id=usuario_id,
            subtotal=quote["subtotal"],
            impuestos=quote["impuestos"],
            envio=quote["envio"],
            total=quote["total"],
            estado="pendiente",
            tipo_entrega=quote["tipo_entrega"],
            numero_mesa=numero_mesa
        )

        # Crear entidades DetallePedido
        detalles = []
        for d in quote["desglose_items"]:
            detalles.append(DetallePedido(
                producto_id=d["producto_id"],
                cantidad=d["cantidad"],
                precio=d["precio"],
                subtotal=d["subtotal"]
            ))

        # Procesar información de pago opcional adjunta al pedido
        pago_obj = None
        metodo_pago = data.get("metodo_pago")
        if metodo_pago:
            metodo_clean = str(metodo_pago).strip().lower()
            if metodo_clean not in METODOS_PAGO_VALIDOS:
                raise ValueError(f"Método de pago '{metodo_pago}' no soportado. Métodos válidos: {', '.join(METODOS_PAGO_VALIDOS)}.")
            
            proveedor = data.get("proveedor_pago", metodo_clean)
            estado_pago = "pendiente"
            pago_obj = Pago(
                metodo=metodo_clean,
                proveedor=proveedor,
                estado=estado_pago
            )

        # Persistir atómicamente
        nuevo_pedido = OrderRepository.create_atomic(pedido, detalles, pago_obj)
        return nuevo_pedido.to_dict(include_relations=True)

    @staticmethod
    def get_user_orders(usuario_id: int) -> list[dict]:
        """Obtiene el historial cronológico de pedidos de un usuario específico."""
        pedidos = OrderRepository.get_all(usuario_id=usuario_id)
        return [p.to_dict(include_relations=True) for p in pedidos]

    @staticmethod
    def get_order_by_id(order_id: int, current_user_id: int | None = None) -> dict:
        """Obtiene los detalles completos de un pedido específico."""
        pedido = OrderRepository.get_by_id(order_id)
        if not pedido:
            raise ValueError(f"Pedido con ID {order_id} no encontrado.")

        if current_user_id is not None and pedido.usuario_id != current_user_id:
            raise PermissionError("No tiene autorización para visualizar los detalles de este pedido.")

        return pedido.to_dict(include_relations=True)

    @staticmethod
    def get_all_orders(estado: str | None = None, limit: int = 50, offset: int = 0) -> list[dict]:
        """Obtiene todos los pedidos del restaurante con paginación y filtros para cocina/admin."""
        pedidos = OrderRepository.get_all(estado=estado, limit=limit, offset=offset)
        return [p.to_dict(include_relations=True) for p in pedidos]

    @staticmethod
    def update_order_status(order_id: int, nuevo_estado: str) -> dict:
        """Valida y actualiza la transición de estados de un pedido."""
        pedido = OrderRepository.get_by_id(order_id)
        if not pedido:
            raise ValueError(f"Pedido con ID {order_id} no encontrado.")

        nuevo_estado_clean = nuevo_estado.strip().lower()
        if nuevo_estado_clean not in ESTADOS_PEDIDO_VALIDOS:
            raise ValueError(f"Estado '{nuevo_estado}' no válido. Estados permitidos: {', '.join(ESTADOS_PEDIDO_VALIDOS)}.")

        estado_actual = pedido.estado
        if estado_actual == nuevo_estado_clean:
            return pedido.to_dict(include_relations=True)

        if estado_actual in ("entregado", "cancelado"):
            raise ValueError(f"No se puede modificar un pedido que ya se encuentra en estado '{estado_actual}'.")

        # Matriz de transiciones válidas
        transiciones_validas = {
            "pendiente": ["preparando", "cancelado"],
            "preparando": ["en camino", "entregado", "cancelado"],
            "en camino": ["entregado", "cancelado"],
        }

        permitidos = transiciones_validas.get(estado_actual, [])
        if nuevo_estado_clean not in permitidos:
            raise ValueError(
                f"Transición de estado inválida: no es posible pasar de '{estado_actual}' a '{nuevo_estado_clean}'. Opciones válidas: {', '.join(permitidos)}."
            )

        updated = OrderRepository.update_status(pedido, nuevo_estado_clean)
        return updated.to_dict(include_relations=True)

    @staticmethod
    def cancel_order(order_id: int, current_user_id: int, razon: str | None = None) -> dict:
        """Cancela un pedido si aún se encuentra en estado 'pendiente'."""
        pedido = OrderRepository.get_by_id(order_id)
        if not pedido:
            raise ValueError(f"Pedido con ID {order_id} no encontrado.")

        if pedido.usuario_id != current_user_id:
            raise PermissionError("No tiene autorización para cancelar este pedido.")

        if pedido.estado != "pendiente":
            raise ValueError(
                f"No es posible cancelar el pedido #{order_id} porque ya se encuentra en '{pedido.estado}'. Por favor comuníquese por WhatsApp con cocina para asistencia inmediata."
            )

        # Actualizar estado a cancelado
        pedido.estado = "cancelado"
        for pago in pedido.pagos:
            if pago.estado == "pendiente":
                pago.estado = "rechazado"

        OrderRepository.save(pedido)
        return pedido.to_dict(include_relations=True)

    @staticmethod
    def generate_whatsapp_message(order_id: int) -> dict:
        """Genera el texto estructurado del pedido y el enlace codificado para la API de WhatsApp."""
        pedido = OrderRepository.get_by_id(order_id)
        if not pedido:
            raise ValueError(f"Pedido con ID {order_id} no encontrado.")

        cliente_nombre = pedido.usuario.nombre if pedido.usuario else "Cliente Towskan"
        fecha_str = pedido.fecha_pedido.strftime("%d/%m/%Y, %I:%M %p") if pedido.fecha_pedido else datetime.now().strftime("%d/%m/%Y, %I:%M %p")
        
        # Modalidad
        modalidad_texto = pedido.tipo_entrega.upper()
        if pedido.tipo_entrega == "en mesa" and pedido.numero_mesa:
            modalidad_texto = f"EN MESA ({pedido.numero_mesa})"

        # Ítems
        items_str_list = []
        for det in pedido.detalles:
            nombre_prod = det.producto.nombre if det.producto else f"Producto #{det.producto_id}"
            items_str_list.append(f"• {det.cantidad}x {nombre_prod} (${det.subtotal:,.0f} COP)")

        items_bloque = "\n".join(items_str_list)

        # Pago
        metodo_pago = pedido.pagos[0].metodo.upper() if pedido.pagos else "POR DEFINIR"

        mensaje = (
            f"🔥 *NUEVO PEDIDO TOWSKAN - ORDEN #{pedido.id}* 🔥\n\n"
            f"👤 *Cliente:* {cliente_nombre}\n"
            f"📍 *Modalidad:* {modalidad_texto}\n"
            f"🕒 *Fecha:* {fecha_str}\n\n"
            f"🍔 *PRODUCTOS SOLICITADOS:*\n"
            f"{items_bloque}\n\n"
            f"💵 *Subtotal:* ${pedido.subtotal:,.0f} COP\n"
            f"🏛️ *Impoconsumo (8%):* ${pedido.impuestos:,.0f} COP\n"
            f"🛵 *Costo Envío:* ${pedido.envio:,.0f} COP\n"
            f"💰 *TOTAL A PAGAR:* ${pedido.total:,.0f} COP\n\n"
            f"💳 *Método de Pago:* {metodo_pago}\n"
            f"📌 *Estado Operativo:* {pedido.estado.upper()}\n\n"
            f"📍 *Sede Valledupar, Cesar* • Towskan Gourmet Express"
        )

        phone = Config.WHATSAPP_PHONE
        encoded_text = urllib.parse.quote(mensaje)
        whatsapp_url = f"https://api.whatsapp.com/send?phone={phone}&text={encoded_text}"

        return {
            "order_id": pedido.id,
            "whatsapp_phone": phone,
            "raw_message": mensaje,
            "whatsapp_url": whatsapp_url
        }

    @staticmethod
    def generate_receipt(order_id: int) -> dict:
        """Genera el comprobante y factura digital con desglose tributario conforme a la normativa."""
        pedido = OrderRepository.get_by_id(order_id)
        if not pedido:
            raise ValueError(f"Pedido con ID {order_id} no encontrado.")

        return {
            "establecimiento": {
                "nombre": Config.RESTAURANTE_NOMBRE,
                "nit": Config.RESTAURANTE_NIT,
                "direccion": Config.RESTAURANTE_DIRECCION,
                "ciudad": "Valledupar, Cesar - Colombia",
                "telefono": f"+{Config.WHATSAPP_PHONE}",
                "regimen": "Impuesto Nacional al Consumo (INC 8%) - Art. 512-1 E.T."
            },
            "factura": {
                "numero_factura": f"TOW-{pedido.id:06d}",
                "fecha_emision": pedido.fecha_pedido.isoformat() if pedido.fecha_pedido else datetime.now().isoformat(),
                "fecha_formateada": pedido.fecha_pedido.strftime("%d/%m/%Y %H:%M:%S") if pedido.fecha_pedido else "",
                "cliente": {
                    "id": pedido.usuario.id if pedido.usuario else None,
                    "nombre": pedido.usuario.nombre if pedido.usuario else "Consumidor Final",
                    "email": pedido.usuario.email if pedido.usuario else "N/A"
                },
                "servicio": {
                    "tipo_entrega": pedido.tipo_entrega,
                    "numero_mesa": pedido.numero_mesa,
                    "estado": pedido.estado
                },
                "items": [
                    {
                        "cantidad": d.cantidad,
                        "descripcion": d.producto.nombre if d.producto else f"Producto #{d.producto_id}",
                        "precio_unitario": float(d.precio),
                        "subtotal": float(d.subtotal)
                    }
                    for d in pedido.detalles
                ],
                "totales": {
                    "subtotal": float(pedido.subtotal),
                    "impoconsumo_8": float(pedido.impuestos),
                    "envio": float(pedido.envio),
                    "total": float(pedido.total)
                },
                "pagos": [
                    {
                        "id": p.id,
                        "metodo": p.metodo,
                        "proveedor": p.proveedor,
                        "estado": p.estado,
                        "fecha": p.fecha_pago.isoformat() if p.fecha_pago else None
                    }
                    for p in pedido.pagos
                ]
            }
        }
