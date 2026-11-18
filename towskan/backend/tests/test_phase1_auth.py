"""
Script de Pruebas Automatizadas para la FASE 1: Autenticación, JWT y Sesión.
Proyecto: Towskan - Sistema Web Interactivo y Gestión de Pedidos.
Normativas: ISO/IEC 25010 (Seguridad y Adecuación Funcional).
"""

import sys
import os
# Asegurar que el path del backend esté disponible
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app import create_app


def run_phase1_tests():
    app = create_app()
    app.config["TESTING"] = True
    client = app.test_client()

    print("\n========================================================")
    print("🚀 INICIANDO PRUEBAS DE INTEGRACIÓN FASE 1 - TOWSKAN AUTH")
    print("========================================================\n")

    # 1. Healthcheck
    res = client.get("/api/health")
    assert res.status_code == 200
    data = res.get_json()
    assert data["status"] == "operational"
    print("✅ 1. Health Check verificado con éxito.")

    # 2. Registro de Usuario con Bcrypt
    test_email = "test.fase1.runner@towskan.com"
    reg_payload = {
        "nombre": "Carlos Mendoza ADSO",
        "email": test_email,
        "password": "PasswordFase1*2026"
    }
    res_reg = client.post("/api/auth/register", json=reg_payload)
    assert res_reg.status_code in [201, 400], f"Fallo en registro: {res_reg.data}"
    print("✅ 2. Registro de usuario local verificado.")

    # 3. Login con credenciales válidas
    res_login = client.post("/api/auth/login", json={
        "email": test_email,
        "password": "PasswordFase1*2026"
    })
    assert res_login.status_code == 200
    login_data = res_login.get_json()["data"]
    token = login_data["token"]
    assert token is not None and len(token) > 20
    print("✅ 3. Autenticación exitosa y emisión de token JWT firmada.")

    # 4. Intento de Login con contraseña incorrecta (Debe ser rechazado 401)
    res_login_bad = client.post("/api/auth/login", json={
        "email": test_email,
        "password": "PasswordIncorrecta123"
    })
    assert res_login_bad.status_code == 401
    print("✅ 4. Rechazo seguro ante credenciales inválidas (HTTP 401).")

    # 5. Consulta de Perfil Protegido /api/auth/me con Token
    headers = {"Authorization": f"Bearer {token}"}
    res_me = client.get("/api/auth/me", headers=headers)
    assert res_me.status_code == 200
    user_data = res_me.get_json()["data"]
    assert user_data["email"] == test_email
    print("✅ 5. Acceso a endpoint protegido /api/auth/me con JWT verificado.")

    print("\n========================================================")
    print("🎉 TODAS LAS 5 PRUEBAS DE FASE 1 PASARON CON ÉXITO")
    print("========================================================\n")


if __name__ == "__main__":
    run_phase1_tests()
