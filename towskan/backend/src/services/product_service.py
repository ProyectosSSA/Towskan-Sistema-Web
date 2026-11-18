from decimal import Decimal, InvalidOperation
from src.repositories.product_repository import ProductRepository
from src.repositories.category_repository import CategoryRepository
from src.models.product import Producto


class ProductService:
    """Capa de Servicios de Negocio para el Catálogo de Productos Towskan."""

    @staticmethod
    def get_all_products(categoria_id: int | None = None, solo_disponibles: bool = False, search: str | None = None) -> list[dict]:
        """Consulta el catálogo de productos aplicando filtros dinámicos."""
        products = ProductRepository.get_all(
            categoria_id=categoria_id,
            solo_disponibles=solo_disponibles,
            search=search
        )
        return [p.to_dict() for p in products]

    @staticmethod
    def get_product_by_id(product_id: int) -> dict:
        """Obtiene el detalle de un producto o lanza excepción si no existe."""
        product = ProductRepository.get_by_id(product_id)
        if not product:
            raise ValueError(f"Producto con ID {product_id} no encontrado.")
        return product.to_dict()

    @staticmethod
    def create_product(data: dict) -> dict:
        """Valida y registra un nuevo producto en el catálogo."""
        # 1. Validar categoría existente
        categoria_id = data.get("categoria_id")
        if not categoria_id:
            raise ValueError("El campo 'categoria_id' es obligatorio.")
        try:
            categoria_id = int(categoria_id)
        except (ValueError, TypeError):
            raise ValueError("El campo 'categoria_id' debe ser un número entero.")

        categoria = CategoryRepository.get_by_id(categoria_id)
        if not categoria:
            raise ValueError(f"La categoría con ID {categoria_id} no existe.")

        # 2. Validar nombre
        nombre = data.get("nombre")
        if not nombre or not isinstance(nombre, str) or not nombre.strip():
            raise ValueError("El campo 'nombre' es obligatorio y debe ser un texto válido.")
        nombre_clean = nombre.strip()
        if len(nombre_clean) < 3 or len(nombre_clean) > 150:
            raise ValueError("El nombre del producto debe tener entre 3 y 150 caracteres.")

        # 3. Validar precio (Decimal con precisión fija)
        precio_raw = data.get("precio")
        if precio_raw is None:
            raise ValueError("El campo 'precio' es obligatorio.")
        try:
            precio = Decimal(str(precio_raw))
            if precio <= 0:
                raise ValueError("El precio debe ser un número mayor a cero.")
        except (InvalidOperation, ValueError, TypeError):
            raise ValueError("El precio proporcionado no es un número decimal válido.")

        descripcion = data.get("descripcion")
        imagen = data.get("imagen")
        disponible = bool(data.get("disponible", True))

        nuevo_producto = ProductRepository.create(
            categoria_id=categoria_id,
            nombre=nombre_clean,
            descripcion=descripcion.strip() if descripcion else None,
            precio=precio,
            imagen=imagen.strip() if imagen else None,
            disponible=disponible
        )
        return nuevo_producto.to_dict()

    @staticmethod
    def update_product(product_id: int, data: dict) -> dict:
        """Valida y actualiza campos de un producto existente."""
        producto = ProductRepository.get_by_id(product_id)
        if not producto:
            raise ValueError(f"Producto con ID {product_id} no encontrado.")

        # Actualizar categoría si se proporciona
        if "categoria_id" in data:
            try:
                cat_id = int(data["categoria_id"])
                categoria = CategoryRepository.get_by_id(cat_id)
                if not categoria:
                    raise ValueError(f"La categoría con ID {cat_id} no existe.")
                producto.categoria_id = cat_id
            except (ValueError, TypeError):
                raise ValueError("El campo 'categoria_id' debe ser un entero válido.")

        # Actualizar nombre
        if "nombre" in data:
            nombre = data["nombre"]
            if not nombre or not isinstance(nombre, str) or not nombre.strip():
                raise ValueError("El campo 'nombre' no puede estar vacío.")
            nombre_clean = nombre.strip()
            if len(nombre_clean) < 3 or len(nombre_clean) > 150:
                raise ValueError("El nombre del producto debe tener entre 3 y 150 caracteres.")
            producto.nombre = nombre_clean

        # Actualizar precio
        if "precio" in data:
            try:
                precio = Decimal(str(data["precio"]))
                if precio <= 0:
                    raise ValueError("El precio debe ser mayor a cero.")
                producto.precio = precio
            except (InvalidOperation, ValueError, TypeError):
                raise ValueError("El precio proporcionado no es un número decimal válido.")

        # Actualizar descripción e imagen
        if "descripcion" in data:
            desc = data["descripcion"]
            producto.descripcion = desc.strip() if desc else None

        if "imagen" in data:
            img = data["imagen"]
            producto.imagen = img.strip() if img else None

        if "disponible" in data:
            producto.disponible = bool(data["disponible"])

        updated = ProductRepository.update(producto)
        return updated.to_dict()

    @staticmethod
    def toggle_availability(product_id: int, disponible: bool | None = None) -> dict:
        """Activa o desactiva la disponibilidad de un producto en el menú."""
        producto = ProductRepository.get_by_id(product_id)
        if not producto:
            raise ValueError(f"Producto con ID {product_id} no encontrado.")

        nuevo_estado = not producto.disponible if disponible is None else bool(disponible)
        updated = ProductRepository.set_availability(producto, nuevo_estado)
        return updated.to_dict()

    @staticmethod
    def delete_product(product_id: int) -> None:
        """Elimina un producto del catálogo si no tiene pedidos históricos asociados."""
        producto = ProductRepository.get_by_id(product_id)
        if not producto:
            raise ValueError(f"Producto con ID {product_id} no encontrado.")

        if producto.detalles and producto.detalles.count() > 0:
            raise ValueError(
                f"No es posible eliminar el producto '{producto.nombre}' porque forma parte de pedidos registrados históricamente. En su lugar, desactive su disponibilidad."
            )

        ProductRepository.delete(producto)

    @staticmethod
    def seed_default_menu() -> dict:
        """Puebla el catálogo de Towskan con categorías y productos gourmet auténticos si está vacío."""
        if ProductRepository.count() > 0:
            return {
                "message": "El menú ya contiene productos registrados. Omitiendo seed.",
                "total_productos": ProductRepository.count()
            }

        categorias_seed = [
            {
                "nombre": "Hamburguesas Gourmet",
                "descripcion": "Carne 100% Angus, pan brioche artesanal y combinaciones exclusivas de autor.",
                "productos": [
                    {
                        "nombre": "Towskan Master Clásica",
                        "descripcion": "200g de carne Angus, queso cheddar fundido, tocineta crujiente, lechuga romana, tomate y salsa Towskan.",
                        "precio": Decimal("24900.00"),
                        "imagen": "/images/menu/towskan-clasica.jpg"
                    },
                    {
                        "nombre": "Doble Queso & Bacon Blast",
                        "descripcion": "Doble porción de carne Angus (400g), doble cheddar madurado, cuádruple tocineta ahumada y cebolla caramelizada.",
                        "precio": Decimal("32900.00"),
                        "imagen": "/images/menu/doble-queso-bacon.jpg"
                    },
                    {
                        "nombre": "Smoked BBQ Crispy Onions",
                        "descripcion": "200g de Angus a la parrilla, queso Monterrey Jack, crujientes aros de cebolla rebozada y salsa BBQ ahumada con miel.",
                        "precio": Decimal("27900.00"),
                        "imagen": "/images/menu/smoked-bbq.jpg"
                    },
                    {
                        "nombre": "Chicken Volcano Crispy",
                        "descripcion": "Pechuga de pollo apanada extracrocante marinada en especias, coleslaw fresco, queso pepper jack y mayonesa de ajo asado.",
                        "precio": Decimal("23900.00"),
                        "imagen": "/images/menu/chicken-crispy.jpg"
                    }
                ]
            },
            {
                "nombre": "Acompañamientos",
                "descripcion": "Crocantes entradas y porciones para elevar la experiencia Towskan.",
                "productos": [
                    {
                        "nombre": "Papas Rústicas Towskan",
                        "descripcion": "Papas corte grueso sazonadas con paprika, romero y sal marina, acompañadas de dip de ajo.",
                        "precio": Decimal("9900.00"),
                        "imagen": "/images/menu/papas-rusticas.jpg"
                    },
                    {
                        "nombre": "Salchipapas Especiales",
                        "descripcion": "Cama de papas francesas crocantes con salchicha manguera premium, queso costeño rallado y tártara de la casa.",
                        "precio": Decimal("16900.00"),
                        "imagen": "/images/menu/salchipapas.jpg"
                    },
                    {
                        "nombre": "Aros de Cebolla Rebozados",
                        "descripcion": "Aros de cebolla dulce marinados en cerveza artesanal y fritos al punto dorado.",
                        "precio": Decimal("11900.00"),
                        "imagen": "/images/menu/aros-cebolla.jpg"
                    }
                ]
            },
            {
                "nombre": "Bebidas & Malteadas",
                "descripcion": "Refrescos helados, jugos naturales y malteadas espesas gourmet.",
                "productos": [
                    {
                        "nombre": "Malteada de Vainilla & Oreo",
                        "descripcion": "Helado artesanal de vainilla batido con galletas Oreo trituradas y crema chantilly.",
                        "precio": Decimal("14500.00"),
                        "imagen": "/images/menu/malteada-oreo.jpg"
                    },
                    {
                        "nombre": "Malteada de Arequipe Colombiano",
                        "descripcion": "Tradicional arequipe de leche caramelizada con crumble de barquillo crujiente.",
                        "precio": Decimal("14500.00"),
                        "imagen": "/images/menu/malteada-arequipe.jpg"
                    },
                    {
                        "nombre": "Limonada de Coco Frappé",
                        "descripcion": "Limones frescos recién exprimidos batidos con crema de coco natural y hielo frappé.",
                        "precio": Decimal("9500.00"),
                        "imagen": "/images/menu/limonada-coco.jpg"
                    },
                    {
                        "nombre": "Gaseosa 400ml",
                        "descripcion": "Coca-Cola clásica, Zero, Sprite o Cuatro bien fría en botella personal.",
                        "precio": Decimal("6000.00"),
                        "imagen": "/images/menu/gaseosa.jpg"
                    }
                ]
            },
            {
                "nombre": "Salsas & Dips Artesanales",
                "descripcion": "Frascos y porciones extras de nuestras recetas de salsas secretas.",
                "productos": [
                    {
                        "nombre": "Salsa Secreta Towskan (Porción)",
                        "descripcion": "Nuestra emulsión insignia con notas ahumadas, pepinillos dulces y mostaza Dijon.",
                        "precio": Decimal("3000.00"),
                        "imagen": "/images/menu/salsa-towskan.jpg"
                    },
                    {
                        "nombre": "Queso Cheddar Fundido Extra",
                        "descripcion": "Copa de cheddar caliente líquido ideal para bañar hamburguesas o papas.",
                        "precio": Decimal("4500.00"),
                        "imagen": "/images/menu/cheddar-dip.jpg"
                    }
                ]
            }
        ]

        creados = 0
        for cat_data in categorias_seed:
            categoria = CategoryRepository.get_by_name(cat_data["nombre"])
            if not categoria:
                categoria = CategoryRepository.create(
                    nombre_categoria=cat_data["nombre"],
                    descripcion=cat_data["descripcion"]
                )

            for prod_data in cat_data["productos"]:
                if not ProductRepository.get_by_name(prod_data["nombre"]):
                    ProductRepository.create(
                        categoria_id=categoria.id,
                        nombre=prod_data["nombre"],
                        descripcion=prod_data["descripcion"],
                        precio=prod_data["precio"],
                        imagen=prod_data["imagen"],
                        disponible=True
                    )
                    creados += 1

        return {
            "message": f"Se sembraron exitosamente {creados} productos en {len(categorias_seed)} categorías.",
            "total_productos": ProductRepository.count()
        }

