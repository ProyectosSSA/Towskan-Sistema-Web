from flask import request, jsonify
from src.services.category_service import CategoryService
from src.models.user import Usuario


class CategoryController:
    """Controlador HTTP para endpoints de Categorías de productos."""

    @staticmethod
    def get_categories():
        """Lista todas las categorías del menú."""
        try:
            categories = CategoryService.get_all_categories()
            return jsonify({
                "success": True,
                "count": len(categories),
                "data": categories
            }), 200
        except Exception as err:
            return jsonify({
                "success": False,
                "error": "Error interno al consultar las categorías.",
                "details": str(err)
            }), 500

    @staticmethod
    def get_category_by_id(category_id: int):
        """Obtiene una categoría por su ID."""
        try:
            category = CategoryService.get_category_by_id(category_id)
            return jsonify({
                "success": True,
                "data": category
            }), 200
        except ValueError as err:
            return jsonify({
                "success": False,
                "error": str(err)
            }), 404
        except Exception as err:
            return jsonify({
                "success": False,
                "error": "Error interno al consultar la categoría.",
                "details": str(err)
            }), 500

    @staticmethod
    def create_category(current_user: Usuario):
        """Crea una nueva categoría (requiere autenticación)."""
        data = request.get_json(silent=True)
        if not data:
            return jsonify({
                "success": False,
                "error": "El cuerpo de la petición debe ser un objeto JSON válido."
            }), 400

        try:
            new_cat = CategoryService.create_category(data)
            return jsonify({
                "success": True,
                "message": "Categoría creada exitosamente.",
                "data": new_cat
            }), 201
        except ValueError as err:
            return jsonify({
                "success": False,
                "error": str(err)
            }), 400
        except Exception as err:
            return jsonify({
                "success": False,
                "error": "Error interno al crear la categoría.",
                "details": str(err)
            }), 500

    @staticmethod
    def update_category(current_user: Usuario, category_id: int):
        """Actualiza una categoría existente (requiere autenticación)."""
        data = request.get_json(silent=True)
        if not data:
            return jsonify({
                "success": False,
                "error": "El cuerpo de la petición debe ser un objeto JSON válido."
            }), 400

        try:
            updated = CategoryService.update_category(category_id, data)
            return jsonify({
                "success": True,
                "message": "Categoría actualizada exitosamente.",
                "data": updated
            }), 200
        except ValueError as err:
            status_code = 404 if "no encontrada" in str(err) else 400
            return jsonify({
                "success": False,
                "error": str(err)
            }), status_code
        except Exception as err:
            return jsonify({
                "success": False,
                "error": "Error interno al actualizar la categoría.",
                "details": str(err)
            }), 500

    @staticmethod
    def delete_category(current_user: Usuario, category_id: int):
        """Elimina una categoría (requiere autenticación)."""
        try:
            CategoryService.delete_category(category_id)
            return jsonify({
                "success": True,
                "message": f"Categoría con ID {category_id} eliminada exitosamente."
            }), 200
        except ValueError as err:
            status_code = 404 if "no encontrada" in str(err) else 400
            return jsonify({
                "success": False,
                "error": str(err)
            }), status_code
        except Exception as err:
            return jsonify({
                "success": False,
                "error": "Error interno al eliminar la categoría.",
                "details": str(err)
            }), 500

