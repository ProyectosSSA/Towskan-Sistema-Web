from flask import request, jsonify
from src.services.auth_service import AuthService
from src.models.user import Usuario


class AuthController:
    """Controlador HTTP para endpoints de autenticación y gestión de usuarios."""

    @staticmethod
    def register():
        data = request.get_json(silent=True)
        if not data:
            return jsonify({
                "success": False,
                "error": "El cuerpo de la petición debe ser un objeto JSON válido."
            }), 400

        nombre = data.get("nombre")
        email = data.get("email")
        password = data.get("password")

        try:
            result = AuthService.register(nombre, email, password)
            return jsonify({
                "success": True,
                "message": "Usuario registrado exitosamente.",
                "data": result
            }), 201
        except ValueError as err:
            return jsonify({
                "success": False,
                "error": str(err)
            }), 400
        except Exception as err:
            return jsonify({
                "success": False,
                "error": "Error interno al procesar el registro.",
                "details": str(err)
            }), 500

    @staticmethod
    def login():
        data = request.get_json(silent=True)
        if not data:
            return jsonify({
                "success": False,
                "error": "El cuerpo de la petición debe ser un objeto JSON válido."
            }), 400

        email = data.get("email")
        password = data.get("password")

        try:
            result = AuthService.login(email, password)
            return jsonify({
                "success": True,
                "message": "Autenticación exitosa.",
                "data": result
            }), 200
        except ValueError as err:
            return jsonify({
                "success": False,
                "error": str(err)
            }), 401
        except Exception as err:
            return jsonify({
                "success": False,
                "error": "Error interno al procesar el inicio de sesión.",
                "details": str(err)
            }), 500

    @staticmethod
    def google_auth():
        data = request.get_json(silent=True)
        if not data:
            return jsonify({
                "success": False,
                "error": "El cuerpo de la petición debe ser un objeto JSON válido."
            }), 400

        google_id = data.get("google_id")
        email = data.get("email")
        nombre = data.get("nombre")

        try:
            result = AuthService.google_auth(google_id, email, nombre)
            return jsonify({
                "success": True,
                "message": "Autenticación con Google exitosa.",
                "data": result
            }), 200
        except ValueError as err:
            return jsonify({
                "success": False,
                "error": str(err)
            }), 400
        except Exception as err:
            return jsonify({
                "success": False,
                "error": "Error interno al procesar la autenticación con Google.",
                "details": str(err)
            }), 500

    @staticmethod
    def get_current_user(current_user: Usuario):
        return jsonify({
            "success": True,
            "data": current_user.to_dict()
        }), 200
