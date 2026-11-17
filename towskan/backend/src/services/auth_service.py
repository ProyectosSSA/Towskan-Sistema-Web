import datetime
import jwt
import bcrypt
from src.config.settings import Config
from src.repositories.user_repository import UserRepository
from src.models.user import Usuario


class AuthService:
    """Capa de Servicio para la lógica de negocio de autenticación y seguridad."""

    @staticmethod
    def hash_password(password: str) -> str:
        """Genera un hash seguro con sal usando bcrypt."""
        salt = bcrypt.gensalt(rounds=12)
        hashed = bcrypt.hashpw(password.encode("utf-8"), salt)
        return hashed.decode("utf-8")

    @staticmethod
    def check_password(password: str, hashed_password: str) -> bool:
        """Verifica una contraseña contra su hash bcrypt."""
        if not hashed_password:
            return False
        return bcrypt.checkpw(password.encode("utf-8"), hashed_password.encode("utf-8"))

    @staticmethod
    def generate_token(usuario: Usuario) -> str:
        """Emite un token JWT firmado con expiración configurada."""
        payload = {
            "sub": str(usuario.id),
            "email": usuario.email,
            "nombre": usuario.nombre,
            "iat": datetime.datetime.now(datetime.timezone.utc),
            "exp": datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(hours=Config.JWT_EXPIRATION_HOURS)
        }
        return jwt.encode(payload, Config.SECRET_KEY, algorithm="HS256")

    @staticmethod
    def decode_token(token: str) -> dict:
        """Decodifica y valida la firma y expiración de un token JWT."""
        return jwt.decode(token, Config.SECRET_KEY, algorithms=["HS256"])

    @classmethod
    def register(cls, nombre: str, email: str, password: str) -> dict:
        """Registra un nuevo usuario local tras validar reglas de negocio."""
        if not nombre or not email or not password:
            raise ValueError("Nombre, correo electrónico y contraseña son obligatorios.")

        if len(password) < 6:
            raise ValueError("La contraseña debe tener al menos 6 caracteres.")

        existente = UserRepository.get_by_email(email)
        if existente:
            raise ValueError("Ya existe una cuenta registrada con este correo electrónico.")

        password_hash = cls.hash_password(password)
        nuevo_usuario = UserRepository.create(
            nombre=nombre,
            email=email,
            password_hash=password_hash,
            proveedor="local"
        )

        token = cls.generate_token(nuevo_usuario)
        return {
            "user": nuevo_usuario.to_dict(),
            "token": token
        }

    @classmethod
    def login(cls, email: str, password: str) -> dict:
        """Autentica credenciales locales y emite un JWT."""
        if not email or not password:
            raise ValueError("Debe ingresar correo electrónico y contraseña.")

        usuario = UserRepository.get_by_email(email)
        if not usuario or not usuario.password:
            raise ValueError("Credenciales inválidas.")

        if not cls.check_password(password, usuario.password):
            raise ValueError("Credenciales inválidas.")

        token = cls.generate_token(usuario)
        return {
            "user": usuario.to_dict(),
            "token": token
        }

    @classmethod
    def google_auth(cls, google_id: str, email: str, nombre: str) -> dict:
        """Autentica o aprovisiona un usuario mediante Google OAuth."""
        if not google_id or not email:
            raise ValueError("Datos de autenticación con Google incompletos.")

        usuario = UserRepository.get_by_google_id(google_id)
        if not usuario:
            # Verificar si ya existe por email
            usuario = UserRepository.get_by_email(email)
            if usuario:
                usuario.google_id = google_id
                UserRepository.save(usuario)
            else:
                usuario = UserRepository.create(
                    nombre=nombre or "Usuario Google",
                    email=email,
                    password_hash=None,
                    proveedor="google",
                    google_id=google_id
                )

        token = cls.generate_token(usuario)
        return {
            "user": usuario.to_dict(),
            "token": token
        }
