from flask import Blueprint
from src.controllers.category_controller import CategoryController
from src.services.jwt_middleware import token_required

category_bp = Blueprint("categories", __name__, url_prefix="/api/categories")

# Endpoints públicos de consulta
category_bp.route("", methods=["GET"])(CategoryController.get_categories)
category_bp.route("/<int:category_id>", methods=["GET"])(CategoryController.get_category_by_id)

# Endpoints protegidos de administración
category_bp.route("", methods=["POST"])(token_required(CategoryController.create_category))
category_bp.route("/<int:category_id>", methods=["PUT"])(token_required(CategoryController.update_category))
category_bp.route("/<int:category_id>", methods=["DELETE"])(token_required(CategoryController.delete_category))

