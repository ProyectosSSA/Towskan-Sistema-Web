from decimal import Decimal
from src.config.database import db
from src.models.product import Producto


class ProductRepository:
    """Capa de Repositorio para la persistencia y consultas de Productos."""

    @staticmethod
    def get_all(categoria_id: int | None = None, solo_disponibles: bool = False, search: str | None = None) -> list[Producto]:
        """Obtiene productos con filtros dinámicos por categoría, disponibilidad y búsqueda."""
        query = Producto.query

        if categoria_id is not None:
            query = query.filter(Producto.categoria_id == categoria_id)

        if solo_disponibles:
            query = query.filter(Producto.disponible.is_(True))

        if search:
            search_pattern = f"%{search.strip().lower()}%"
            query = query.filter(
                db.or_(
                    db.func.lower(Producto.nombre).like(search_pattern),
                    db.func.lower(Producto.descripcion).like(search_pattern)
                )
            )

        return query.order_by(Producto.categoria_id.asc(), Producto.id.asc()).all()

    @staticmethod
    def get_by_id(product_id: int) -> Producto | None:
        """Busca un producto por su clave primaria."""
        return db.session.get(Producto, product_id)

    @staticmethod
    def get_by_name(nombre: str) -> Producto | None:
        """Busca un producto por coincidencia exacta de nombre (case-insensitive)."""
        return Producto.query.filter(
            db.func.lower(Producto.nombre) == nombre.strip().lower()
        ).first()

    @staticmethod
    def create(
        categoria_id: int,
        nombre: str,
        descripcion: str | None,
        precio: Decimal | float,
        imagen: str | None = None,
        disponible: bool = True
    ) -> Producto:
        """Crea y persiste un nuevo producto en el catálogo."""
        producto = Producto(
            categoria_id=categoria_id,
            nombre=nombre.strip(),
            descripcion=descripcion.strip() if descripcion else None,
            precio=precio,
            imagen=imagen.strip() if imagen else None,
            disponible=disponible
        )
        db.session.add(producto)
        db.session.commit()
        return producto

    @staticmethod
    def update(
        producto: Producto,
        categoria_id: int | None = None,
        nombre: str | None = None,
        descripcion: str | None = None,
        precio: Decimal | float | None = None,
        imagen: str | None = None,
        disponible: bool | None = None
    ) -> Producto:
        """Actualiza los campos proporcionados de un producto."""
        if categoria_id is not None:
            producto.categoria_id = categoria_id
        if nombre is not None:
            producto.nombre = nombre.strip()
        if descripcion is not None:
            producto.descripcion = descripcion.strip()
        if precio is not None:
            producto.precio = precio
        if imagen is not None:
            producto.imagen = imagen.strip() if imagen else None
        if disponible is not None:
            producto.disponible = disponible

        db.session.commit()
        return producto

    @staticmethod
    def set_availability(producto: Producto, disponible: bool) -> Producto:
        """Actualiza únicamente el flag de disponibilidad del producto."""
        producto.disponible = disponible
        db.session.commit()
        return producto

    @staticmethod
    def delete(producto: Producto) -> None:
        """Elimina un producto del catálogo."""
        db.session.delete(producto)
        db.session.commit()

    @staticmethod
    def count() -> int:
        """Retorna la cantidad total de productos en la base de datos."""
        return Producto.query.count()

