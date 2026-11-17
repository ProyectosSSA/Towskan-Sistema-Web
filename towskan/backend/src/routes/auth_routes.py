from flask import Blueprint
from src.controllers.auth_controller import AuthController
from src.services.jwt_middleware import token_required

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")

auth_bp.route("/register", methods=["POST"])(AuthController.register)
auth_bp.route("/login", methods=["POST"])(AuthController.login)
auth_bp.route("/google", methods=["POST"])(AuthController.google_auth)
auth_bp.route("/me", methods=["GET"])(token_required(AuthController.get_current_user))
