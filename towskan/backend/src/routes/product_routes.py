from flask import Blueprint
from src.controllers.product_controller import ProductController
from src.services.jwt_middleware import token_required

product_bp = Blueprint("products", __name__, url_prefix="/api/products")

# Endpoints públicos de consulta del menú
product_bp.route("", methods=["GET"])(ProductController.get_products)
product_bp.route("/<int:product_id>", methods=["GET"])(ProductController.get_product_by_id)
product_bp.route("/seed", methods=["POST"])(ProductController.seed_menu)

# Endpoints protegidos de administración
product_bp.route("", methods=["POST"])(token_required(ProductController.create_product))
product_bp.route("/<int:product_id>", methods=["PUT"])(token_required(ProductController.update_product))
product_bp.route("/<int:product_id>/availability", methods=["PATCH"])(token_required(ProductController.update_availability))
product_bp.route("/<int:product_id>", methods=["DELETE"])(token_required(ProductController.delete_product))

