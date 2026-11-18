"""
Script de Pruebas Automatizadas para la FASE 2: Entidades Core y CRUD Principal.
Proyecto: Towskan - Sistema Web Interactivo y Gestión de Pedidos.
Normativas: ISO/IEC 25010 (Adecuación Funcional y Fiabilidad Matemática).
"""

import json
from decimal import Decimal
from app import create_app
from src.config.database import db
from src.models.user import Usuario


def run_tests():
    app = create_app()
    app.config["TESTING"] = True
    client = app.test_client()

    print("\n========================================================")
    print("🚀 INICIANDO PRUEBAS DE INTEGRACIÓN FASE 2 - TOWSKAN")
    print("========================================================\n")

    # ---------------------------------------------------------
    # 1. Health Check
    # ---------------------------------------------------------
    res = client.get("/api/health")
    assert res.status_code == 200, f"Health check falló: {res.data}"
    data = res.get_json()
    assert data["phase"] == "Fase 2 - Entidades Core y CRUD Principal"
    print("✅ 1. Health Check verificado con éxito (API v2.0.0).")

    # ---------------------------------------------------------
    # 2. Categorías (Lectura y Creación)
    # ---------------------------------------------------------
    res = client.get("/api/categories")
    assert res.status_code == 200
    cat_data = res.get_json()
    assert cat_data["success"] is True
    assert cat_data["count"] >= 4, "Debe haber al menos 4 categorías iniciales sembradas"
    cat_hamburguesas = next((c for c in cat_data["data"] if c["nombre_categoria"] == "Hamburguesas Gourmet"), None)
    assert cat_hamburguesas is not None
    print(f"✅ 2. Categorías consultadas ({cat_data['count']} categorías encontradas).")

    # ---------------------------------------------------------
    # 3. Productos (Catálogo, Filtros y Búsqueda)
    # ---------------------------------------------------------
    # Filtro por categoría
    res = client.get(f"/api/products?categoria_id={cat_hamburguesas['id']}")
    assert res.status_code == 200
    prod_cat = res.get_json()
    assert prod_cat["success"] is True
    assert prod_cat["count"] >= 4
    for p in prod_cat["data"]:
        assert p["categoria_id"] == cat_hamburguesas["id"]

    # Búsqueda por texto
    res = client.get("/api/products?search=angus")
    assert res.status_code == 200
    prod_search = res.get_json()
    assert prod_search["success"] is True
    assert prod_search["count"] >= 1
    print(f"✅ 3. Catálogo de productos filtrado y buscado con éxito ({prod_cat['count']} hamburguesas).")

    # ---------------------------------------------------------
    # 4. Cotizador Financiero Matemático (RF-03 & RNF-03)
    # ---------------------------------------------------------
    # Buscar producto 1 (Towskan Master Clásica = 24,900.00 COP)
    p1 = prod_cat["data"][0]
    precio_p1 = Decimal(str(p1["precio"]))

    # Cotizar 2 hamburguesas a domicilio
    # Subtotal = 24,900 * 2 = 49,800.00
    # Impuestos (8%) = 49,800 * 0.08 = 3,984.00
    # Envío = 5,000.00
    # Total = 49,800 + 3,984 + 5,000 = 58,784.00
    quote_payload = {
        "items": [{"producto_id": p1["id"], "cantidad": 2}],
        "tipo_entrega": "domicilio"
    }
    res = client.post("/api/orders/quote", json=quote_payload)
    assert res.status_code == 200
    quote_res = res.get_json()["data"]
    subtotal_esperado = float(precio_p1 * 2)
    impuesto_esperado = round(subtotal_esperado * 0.08, 2)
    envio_esperado = 5000.00
    total_esperado = subtotal_esperado + impuesto_esperado + envio_esperado

    assert abs(quote_res["subtotal"] - subtotal_esperado) < 0.01
    assert abs(quote_res["impuestos"] - impuesto_esperado) < 0.01
    assert abs(quote_res["envio"] - envio_esperado) < 0.01
    assert abs(quote_res["total"] - total_esperado) < 0.01
    print(f"✅ 4. Cotizador matemático validado al 100%: Subtotal={quote_res['subtotal']}, Impuestos(8%)={quote_res['impuestos']}, Envío={quote_res['envio']}, Total={quote_res['total']}.")

    # ---------------------------------------------------------
    # 5. Autenticación de Usuario Cliente (JWT Real)
    # ---------------------------------------------------------
    test_email = "cliente.prueba.fase2@towskan.com"
    client.post("/api/auth/register", json={
        "nombre": "Carlos Mendoza Test",
        "email": test_email,
        "password": "PasswordFase2*2026"
    })
    login_res = client.post("/api/auth/login", json={
        "email": test_email,
        "password": "PasswordFase2*2026"
    })
    assert login_res.status_code == 200
    token = login_res.get_json()["data"]["token"]
    headers = {"Authorization": f"Bearer {token}"}
    print("✅ 5. Cliente autenticado y token JWT obtenido.")

    # ---------------------------------------------------------
    # 6. Creación Atómica de Pedido en Modalidad 'en mesa'
    # ---------------------------------------------------------
    # Validar que si es 'en mesa' sin 'numero_mesa' falle
    res_fail_mesa = client.post("/api/orders", json={
        "items": [{"producto_id": p1["id"], "cantidad": 1}],
        "tipo_entrega": "en mesa"
    }, headers=headers)
    assert res_fail_mesa.status_code == 400
    assert "número de mesa" in res_fail_mesa.get_json()["error"]

    # Crear orden válida 'en mesa'
    order_mesa_payload = {
        "items": [
            {"producto_id": p1["id"], "cantidad": 2}
        ],
        "tipo_entrega": "en mesa",
        "numero_mesa": "Mesa 07",
        "metodo_pago": "efectivo"
    }
    res_order = client.post("/api/orders", json=order_mesa_payload, headers=headers)
    assert res_order.status_code == 201
    order_data = res_order.get_json()["data"]
    order_id = order_data["id"]
    assert order_data["estado"] == "pendiente"
    assert order_data["tipo_entrega"] == "en mesa"
    assert order_data["numero_mesa"] == "Mesa 07"
    assert order_data["envio"] == 0.00  # En mesa no hay costo de envío
    assert len(order_data["detalles"]) == 1
    assert len(order_data["pagos"]) == 1
    assert order_data["pagos"][0]["metodo"] == "efectivo"
    assert order_data["pagos"][0]["estado"] == "pendiente"
    print(f"✅ 6. Pedido #{order_id} en mesa creado atómicamente con éxito.")

    # ---------------------------------------------------------
    # 7. Consulta de Historial de Pedidos del Cliente
    # ---------------------------------------------------------
    res_my_orders = client.get("/api/orders/my-orders", headers=headers)
    assert res_my_orders.status_code == 200
    my_orders = res_my_orders.get_json()["data"]
    assert len(my_orders) >= 1
    assert any(o["id"] == order_id for o in my_orders)

    # Detalle individual
    res_order_detail = client.get(f"/api/orders/{order_id}", headers=headers)
    assert res_order_detail.status_code == 200
    assert res_order_detail.get_json()["data"]["id"] == order_id
    print(f"✅ 7. Historial y detalle individual de pedidos del cliente verificados.")

    # ---------------------------------------------------------
    # 8. Transacciones de Pago y Sincronización de Estados
    # ---------------------------------------------------------
    # Registrar un pago electrónico (Nequi) y aprobarlo
    res_pay = client.post("/api/payments", json={
        "pedido_id": order_id,
        "metodo": "nequi",
        "proveedor": "Nequi Colombia",
        "estado": "aprobado"
    }, headers=headers)
    assert res_pay.status_code == 201
    pay_data = res_pay.get_json()["data"]
    assert pay_data["metodo"] == "nequi"
    assert pay_data["estado"] == "aprobado"

    # Verificar que el pedido pasó de 'pendiente' a 'preparando' tras pago aprobado
    res_check_order = client.get(f"/api/orders/{order_id}", headers=headers)
    assert res_check_order.get_json()["data"]["estado"] == "preparando"
    print("✅ 8. Transacción de pago procesada y sincronizada (pedido avanzó a 'preparando').")

    # ---------------------------------------------------------
    # 9. Flujo de Transición de Estados del Pedido
    # ---------------------------------------------------------
    # Preparando -> En camino -> Entregado
    res_camino = client.patch(f"/api/orders/{order_id}/status", json={"estado": "en camino"}, headers=headers)
    assert res_camino.status_code == 200
    assert res_camino.get_json()["data"]["estado"] == "en camino"

    res_entregado = client.patch(f"/api/orders/{order_id}/status", json={"estado": "entregado"}, headers=headers)
    assert res_entregado.status_code == 200
    assert res_entregado.get_json()["data"]["estado"] == "entregado"

    # Intentar modificar un pedido ya entregado (debe fallar según reglas de negocio)
    res_fail_mod = client.patch(f"/api/orders/{order_id}/status", json={"estado": "pendiente"}, headers=headers)
    assert res_fail_mod.status_code == 400
    assert "no se puede modificar" in res_fail_mod.get_json()["error"].lower()
    print("✅ 9. Matriz de transición de estados y bloqueo de estados finales validada.")

    # ---------------------------------------------------------
    # 10. Gestión de Disponibilidad de Productos
    # ---------------------------------------------------------
    # Inactivar producto 1
    res_avail = client.patch(f"/api/products/{p1['id']}/availability", json={"disponible": False}, headers=headers)
    assert res_avail.status_code == 200
    assert res_avail.get_json()["data"]["disponible"] is False

    # Intentar crear orden con producto inactivo (debe rechazarse)
    res_order_unavail = client.post("/api/orders", json={
        "items": [{"producto_id": p1["id"], "cantidad": 1}],
        "tipo_entrega": "para llevar"
    }, headers=headers)
    assert res_order_unavail.status_code == 400
    assert "no se encuentra disponible" in res_order_unavail.get_json()["error"].lower()

    # Reactivar producto 1
    client.patch(f"/api/products/{p1['id']}/availability", json={"disponible": True}, headers=headers)
    print("✅ 10. Control de disponibilidad de menú verificado (rechazo de productos inactivos).")

    print("\n========================================================")
    print("🎉 TODAS LAS PRUEBAS DE LA FASE 2 PASARON EXITOSAMENTE (10/10)")
    print("========================================================\n")


if __name__ == "__main__":
    run_tests()

