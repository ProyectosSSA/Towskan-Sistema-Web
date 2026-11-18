from flask import request, jsonify
from src.services.product_service import ProductService
from src.models.user import Usuario


class ProductController:
    """Controlador HTTP para endpoints del catálogo de Productos."""

    @staticmethod
    def get_products():
        """Obtiene productos con filtros opcionales de categoría, disponibilidad y búsqueda."""
        try:
            categoria_id = request.args.get("categoria_id", type=int)
            solo_disponibles_raw = request.args.get("disponible")
            solo_disponibles = False
            if solo_disponibles_raw is not None:
                solo_disponibles = solo_disponibles_raw.lower() in ("true", "1", "yes")

            search = request.args.get("search")

            products = ProductService.get_all_products(
                categoria_id=categoria_id,
                solo_disponibles=solo_disponibles,
                search=search
            )
            return jsonify({
                "success": True,
                "count": len(products),
                "data": products
            }), 200
        except Exception as err:
            return jsonify({
                "success": False,
                "error": "Error interno al consultar los productos.",
                "details": str(err)
            }), 500

    @staticmethod
    def get_product_by_id(product_id: int):
        """Obtiene el detalle de un producto por su ID."""
        try:
            product = ProductService.get_product_by_id(product_id)
            return jsonify({
                "success": True,
                "data": product
            }), 200
        except ValueError as err:
            return jsonify({
                "success": False,
                "error": str(err)
            }), 404
        except Exception as err:
            return jsonify({
                "success": False,
                "error": "Error interno al consultar el producto.",
                "details": str(err)
            }), 500

    @staticmethod
    def create_product(current_user: Usuario):
        """Crea un nuevo producto en el catálogo (requiere autenticación)."""
        data = request.get_json(silent=True)
        if not data:
            return jsonify({
                "success": False,
                "error": "El cuerpo de la petición debe ser un objeto JSON válido."
            }), 400

        try:
            nuevo_producto = ProductService.create_product(data)
            return jsonify({
                "success": True,
                "message": "Producto creado exitosamente.",
                "data": nuevo_producto
            }), 201
        except ValueError as err:
            return jsonify({
                "success": False,
                "error": str(err)
            }), 400
        except Exception as err:
            return jsonify({
                "success": False,
                "error": "Error interno al crear el producto.",
                "details": str(err)
            }), 500

    @staticmethod
    def update_product(current_user: Usuario, product_id: int):
        """Actualiza campos de un producto existente (requiere autenticación)."""
        data = request.get_json(silent=True)
        if not data:
            return jsonify({
                "success": False,
                "error": "El cuerpo de la petición debe ser un objeto JSON válido."
            }), 400

        try:
            updated = ProductService.update_product(product_id, data)
            return jsonify({
                "success": True,
                "message": "Producto actualizado exitosamente.",
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
                "error": "Error interno al actualizar el producto.",
                "details": str(err)
            }), 500

    @staticmethod
    def update_availability(current_user: Usuario, product_id: int):
        """Alterna o establece la disponibilidad de un producto (requiere autenticación)."""
        data = request.get_json(silent=True) or {}
        disponible = data.get("disponible") if "disponible" in data else None

        try:
            updated = ProductService.toggle_availability(product_id, disponible)
            return jsonify({
                "success": True,
                "message": f"Disponibilidad del producto actualizada a {updated['disponible']}.",
                "data": updated
            }), 200
        except ValueError as err:
            return jsonify({
                "success": False,
                "error": str(err)
            }), 404
        except Exception as err:
            return jsonify({
                "success": False,
                "error": "Error interno al cambiar la disponibilidad del producto.",
                "details": str(err)
            }), 500

    @staticmethod
    def delete_product(current_user: Usuario, product_id: int):
        """Elimina un producto del catálogo (requiere autenticación)."""
        try:
            ProductService.delete_product(product_id)
            return jsonify({
                "success": True,
                "message": f"Producto con ID {product_id} eliminado exitosamente."
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
                "error": "Error interno al eliminar el producto.",
                "details": str(err)
            }), 500

    @staticmethod
    def seed_menu():
        """Inicializa el menú gourmet con las recetas y categorías oficiales de Towskan."""
        try:
            result = ProductService.seed_default_menu()
            return jsonify({
                "success": True,
                "data": result
            }), 200
        except Exception as err:
            return jsonify({
                "success": False,
                "error": "Error al sembrar el menú por defecto.",
                "details": str(err)
            }), 500

