from functools import wraps
from flask import request, jsonify
import jwt
from src.services.auth_service import AuthService
from src.repositories.user_repository import UserRepository


def token_required(f):
    """Decorador de ruta para validar el Bearer Token JWT en headers HTTP."""
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get("Authorization")
        if not auth_header:
            return jsonify({
                "success": False,
                "error": "Token de autenticación no proporcionado en la cabecera Authorization."
            }), 401

        parts = auth_header.split()
        if len(parts) != 2 or parts[0].lower() != "bearer":
            return jsonify({
                "success": False,
                "error": "Formato de token inválido. Utilice 'Bearer <token>'."
            }), 401

        token = parts[1]
        try:
            payload = AuthService.decode_token(token)
            user_id = int(payload["sub"])
            current_user = UserRepository.get_by_id(user_id)
            if not current_user:
                return jsonify({
                    "success": False,
                    "error": "El usuario asociado al token no existe."
                }), 401
        except jwt.ExpiredSignatureError:
            return jsonify({
                "success": False,
                "error": "La sesión ha expirado. Por favor inicie sesión nuevamente."
            }), 401
        except jwt.InvalidTokenError:
            return jsonify({
                "success": False,
                "error": "Token de autenticación inválido o corrupto."
            }), 401

        return f(current_user, *args, **kwargs)

    return decorated
