"""
Script de Pruebas Automatizadas para la FASE 4: Lógica de Negocio Avanzada, Notificaciones y Facturación.
Proyecto: Towskan - Sistema Web Interactivo y Gestión de Pedidos.
Normativas: ISO/IEC 25010 (Fiabilidad, Adecuación Funcional y Seguridad).
"""

from decimal import Decimal
from app import create_app
from src.models.product import Producto


def run_phase4_tests():
    app = create_app()
    app.config["TESTING"] = True
    client = app.test_client()

    print("\n========================================================")
    print("🚀 INICIANDO PRUEBAS DE INTEGRACIÓN FASE 4 - TOWSKAN")
    print("========================================================\n")

    # 1. Login de usuario de pruebas
    test_email = "cliente.prueba.fase4@towskan.com"
    client.post("/api/auth/register", json={
        "nombre": "Ana Sofía Ospina",
        "email": test_email,
        "password": "PasswordFase4*2026"
    })
    login_res = client.post("/api/auth/login", json={
        "email": test_email,
        "password": "PasswordFase4*2026"
    })
    token = login_res.get_json()["data"]["token"]
    headers = {"Authorization": f"Bearer {token}"}
    print("✅ 1. Usuario autenticado y token JWT obtenido.")

    # Obtener un producto para pruebas
    with app.app_context():
        p1 = Producto.query.filter_by(disponible=True).first()
        assert p1 is not None, "Debe existir al menos un producto disponible en el menú"
        p1_id = p1.id
        p1_precio = float(p1.precio)

    # 2. Validación de Límites y Monto Mínimo de Domicilio
    # Si intentamos un domicilio con un monto bajo (ej. una salsa de $3.000)
    res_min_fail = client.post("/api/orders", json={
        "items": [{"producto_id": p1_id, "cantidad": 0}],
        "tipo_entrega": "domicilio"
    }, headers=headers)
    assert res_min_fail.status_code == 400
    print("✅ 2. Validación de cantidad mínima (rechazo de cantidad 0) verificada.")

    # 3. Creación de Pedido para Notificaciones
    order_res = client.post("/api/orders", json={
        "items": [{"producto_id": p1_id, "cantidad": 2}],
        "tipo_entrega": "domicilio",
        "metodo_pago": "nequi"
    }, headers=headers)
    assert order_res.status_code == 201
    order_data = order_res.get_json()["data"]
    order_id = order_data["id"]
    print(f"✅ 3. Pedido #{order_id} creado con éxito para pruebas de WhatsApp y Facturación.")

    # 4. Generación de Mensaje y Enlace de WhatsApp a Cocina
    wa_res = client.get(f"/api/orders/{order_id}/whatsapp")
    assert wa_res.status_code == 200
    wa_data = wa_res.get_json()["data"]
    assert wa_data["order_id"] == order_id
    assert "api.whatsapp.com" in wa_data["whatsapp_url"]
    assert "573001234567" in wa_data["whatsapp_url"]
    assert f"ORDEN #{order_id}" in wa_data["raw_message"]
    assert "Impoconsumo" in wa_data["raw_message"]
    assert "Valledupar" in wa_data["raw_message"]
    print("✅ 4. Formato de mensaje y enlace oficial para WhatsApp generados con éxito.")

    # 5. Generación de Comprobante y Factura Digital (DIAN / E.T.)
    rec_res = client.get(f"/api/orders/{order_id}/receipt")
    assert rec_res.status_code == 200
    rec_data = rec_res.get_json()["data"]
    assert rec_data["establecimiento"]["nit"] == "901.834.123-5"
    assert rec_data["factura"]["numero_factura"] == f"TOW-{order_id:06d}"
    assert rec_data["factura"]["totales"]["impoconsumo_8"] > 0
    assert len(rec_data["factura"]["items"]) == 1
    print(f"✅ 5. Factura digital TOW-{order_id:06d} con desglose tributario generada con éxito.")

    # 6. Consulta Rápida de Estado
    status_res = client.get(f"/api/orders/{order_id}/status")
    assert status_res.status_code == 200
    assert status_res.get_json()["data"]["estado"] == "pendiente"
    print("✅ 6. Consulta reactiva de estado verificada.")

    # 7. Reglas de Cancelación: Cancelación Exitosa cuando es 'pendiente'
    cancel_res = client.post(f"/api/orders/{order_id}/cancel", json={
        "razon": "Cambio de planes del cliente"
    }, headers=headers)
    assert cancel_res.status_code == 200
    assert cancel_res.get_json()["data"]["estado"] == "cancelado"
    print(f"✅ 7. Cancelación de orden #{order_id} en estado 'pendiente' procesada exitosamente.")

    # 8. Reglas de Cancelación: Rechazo cuando la orden ya está en 'preparando'
    # Creamos otra orden y la avanzamos a preparando
    order2_res = client.post("/api/orders", json={
        "items": [{"producto_id": p1_id, "cantidad": 1}],
        "tipo_entrega": "para llevar",
        "metodo_pago": "efectivo"
    }, headers=headers)
    order2_id = order2_res.get_json()["data"]["id"]
    client.patch(f"/api/orders/{order2_id}/status", json={"estado": "preparando"}, headers=headers)

    # Intentar cancelar orden 2 en cocina (debe ser rechazada)
    cancel2_res = client.post(f"/api/orders/{order2_id}/cancel", json={}, headers=headers)
    assert cancel2_res.status_code == 400
    assert "no es posible cancelar" in cancel2_res.get_json()["error"].lower()
    print(f"✅ 8. Bloqueo de cancelación para orden #{order2_id} en cocina validado estrictamente.")

    # 9. Control de Cancelación no autorizada (usuario ajeno)
    test_user2 = "hacker@towskan.com"
    client.post("/api/auth/register", json={
        "nombre": "Otro Usuario",
        "email": test_user2,
        "password": "PasswordHacker*2026"
    })
    login_user2 = client.post("/api/auth/login", json={
        "email": test_user2,
        "password": "PasswordHacker*2026"
    })
    token_user2 = login_user2.get_json()["data"]["token"]
    headers_user2 = {"Authorization": f"Bearer {token_user2}"}

    res_forbidden = client.post(f"/api/orders/{order2_id}/cancel", json={}, headers=headers_user2)
    assert res_forbidden.status_code == 403
    print("✅ 9. Control de permisos y seguridad IDOR verificado (403 Forbidden).")

    print("\n========================================================")
    print("🎉 TODAS LAS PRUEBAS DE LA FASE 4 PASARON EXITOSAMENTE (9/9)")
    print("========================================================\n")


if __name__ == "__main__":
    run_phase4_tests()

