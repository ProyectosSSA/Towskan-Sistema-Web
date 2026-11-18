from src.config.database import db
from src.models.category import Categoria


class CategoryRepository:
    """Capa de Repositorio para la persistencia y consultas de Categorías."""

    @staticmethod
    def get_all() -> list[Categoria]:
        """Obtiene todas las categorías ordenadas por ID."""
        return Categoria.query.order_by(Categoria.id.asc()).all()

    @staticmethod
    def get_by_id(category_id: int) -> Categoria | None:
        """Busca una categoría por su clave primaria."""
        return db.session.get(Categoria, category_id)

    @staticmethod
    def get_by_name(nombre: str) -> Categoria | None:
        """Busca una categoría por su nombre exacto (case-insensitive)."""
        return Categoria.query.filter(
            db.func.lower(Categoria.nombre_categoria) == nombre.strip().lower()
        ).first()

    @staticmethod
    def create(nombre_categoria: str, descripcion: str | None = None) -> Categoria:
        """Crea y persiste una nueva categoría."""
        categoria = Categoria(
            nombre_categoria=nombre_categoria.strip(),
            descripcion=descripcion.strip() if descripcion else None
        )
        db.session.add(categoria)
        db.session.commit()
        return categoria

    @staticmethod
    def update(categoria: Categoria, nombre_categoria: str | None = None, descripcion: str | None = None) -> Categoria:
        """Actualiza los datos de una categoría existente."""
        if nombre_categoria is not None:
            categoria.nombre_categoria = nombre_categoria.strip()
        if descripcion is not None:
            categoria.descripcion = descripcion.strip()
        db.session.commit()
        return categoria

    @staticmethod
    def delete(categoria: Categoria) -> None:
        """Elimina una categoría de la base de datos."""
        db.session.delete(categoria)
        db.session.commit()

