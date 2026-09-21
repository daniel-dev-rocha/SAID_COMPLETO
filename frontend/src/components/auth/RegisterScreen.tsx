import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";

export default function RegisterScreen() {
  const { registrar } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setEnviando(true);
    try {
      await registrar({
        nombre_usuario: nombre,
        apellido_usuario: apellido,
        correo_usuario: correo,
        contrasena,
      });
      showToast("¡Cuenta creada! Bienvenido a SAID.");
      navigate("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo crear la cuenta.");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="auth-screen">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-icon">📘</div>
          <div className="auth-logo-title">SAID</div>
          <div className="auth-logo-sub">Sistema de Aprendizaje Interactivo Digital</div>
        </div>
        <form className="auth-body" onSubmit={handleSubmit}>
          <div>
            <div className="auth-title">Crea tu cuenta</div>
            <div className="auth-sub">Centraliza tus tareas académicas en un solo sistema.</div>
          </div>

          {error && (
            <div style={{ background: "var(--red-l)", color: "var(--red)", padding: "10px 12px", borderRadius: 10, fontSize: 13 }}>
              {error}
            </div>
          )}

          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="nombre">Nombre</label>
              <input id="nombre" className="form-input" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="apellido">Apellido</label>
              <input id="apellido" className="form-input" value={apellido} onChange={(e) => setApellido(e.target.value)} required />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="correo">Correo</label>
            <input
              id="correo"
              className="form-input"
              type="email"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="contrasena">Contraseña</label>
            <input
              id="contrasena"
              className="form-input"
              type="password"
              value={contrasena}
              onChange={(e) => setContrasena(e.target.value)}
              required
              minLength={6}
            />
          </div>

          <button className="btn btn-primary" type="submit" disabled={enviando}>
            {enviando ? "Creando cuenta..." : "Crear cuenta"}
          </button>

          <div className="auth-link">
            ¿Ya tienes cuenta? <Link to="/login"><span>Inicia sesión</span></Link>
          </div>
        </form>
      </div>
    </div>
  );
}
