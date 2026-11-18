from src.repositories.category_repository import CategoryRepository
from src.models.category import Categoria


class CategoryService:
    """Capa de Servicios de Negocio para la administración de Categorías."""

    @staticmethod
    def get_all_categories() -> list[dict]:
        """Retorna todas las categorías formateadas para respuesta JSON."""
        categories = CategoryRepository.get_all()
        return [cat.to_dict() for cat in categories]

    @staticmethod
    def get_category_by_id(category_id: int) -> dict:
        """Obtiene una categoría por su ID o lanza ValueError si no existe."""
        category = CategoryRepository.get_by_id(category_id)
        if not category:
            raise ValueError(f"Categoría con ID {category_id} no encontrada.")
        return category.to_dict()

    @staticmethod
    def create_category(data: dict) -> dict:
        """Valida y crea una nueva categoría de productos."""
        nombre = data.get("nombre_categoria")
        if not nombre or not isinstance(nombre, str) or not nombre.strip():
            raise ValueError("El campo 'nombre_categoria' es obligatorio y debe ser un texto válido.")

        nombre_clean = nombre.strip()
        if len(nombre_clean) < 3 or len(nombre_clean) > 100:
            raise ValueError("El nombre de la categoría debe tener entre 3 y 100 caracteres.")

        existing = CategoryRepository.get_by_name(nombre_clean)
        if existing:
            raise ValueError(f"Ya existe una categoría registrada con el nombre '{nombre_clean}'.")

        descripcion = data.get("descripcion")
        if descripcion is not None and not isinstance(descripcion, str):
            raise ValueError("La descripción debe ser una cadena de texto.")

        new_cat = CategoryRepository.create(
            nombre_categoria=nombre_clean,
            descripcion=descripcion.strip() if descripcion else None
        )
        return new_cat.to_dict()

    @staticmethod
    def update_category(category_id: int, data: dict) -> dict:
        """Valida y actualiza los datos de una categoría existente."""
        category = CategoryRepository.get_by_id(category_id)
        if not category:
            raise ValueError(f"Categoría con ID {category_id} no encontrada.")

        nombre = data.get("nombre_categoria")
        if nombre is not None:
            if not isinstance(nombre, str) or not nombre.strip():
                raise ValueError("El campo 'nombre_categoria' no puede estar vacío.")
            nombre_clean = nombre.strip()
            if len(nombre_clean) < 3 or len(nombre_clean) > 100:
                raise ValueError("El nombre de la categoría debe tener entre 3 y 100 caracteres.")
            
            existing = CategoryRepository.get_by_name(nombre_clean)
            if existing and existing.id != category.id:
                raise ValueError(f"Ya existe otra categoría con el nombre '{nombre_clean}'.")
            category.nombre_categoria = nombre_clean

        if "descripcion" in data:
            descripcion = data.get("descripcion")
            if descripcion is not None and not isinstance(descripcion, str):
                raise ValueError("La descripción debe ser una cadena de texto.")
            category.descripcion = descripcion.strip() if descripcion else None

        updated = CategoryRepository.update(category)
        return updated.to_dict()

    @staticmethod
    def delete_category(category_id: int) -> None:
        """Elimina una categoría si no contiene productos vinculados."""
        category = CategoryRepository.get_by_id(category_id)
        if not category:
            raise ValueError(f"Categoría con ID {category_id} no encontrada.")

        if category.productos and len(category.productos) > 0:
            raise ValueError(f"No se puede eliminar la categoría '{category.nombre_categoria}' porque contiene {len(category.productos)} productos asociados. Reasigne o elimine los productos primero.")

        CategoryRepository.delete(category)

