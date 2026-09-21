import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";

export default function LoginScreen() {
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setEnviando(true);
    try {
      await login(correo, contrasena);
      showToast("¡Bienvenido de nuevo a SAID!");
      navigate("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo iniciar sesión.");
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
            <div className="auth-title">Inicia sesión</div>
            <div className="auth-sub">Organiza tus actividades académicas en un solo lugar.</div>
          </div>

          {error && (
            <div style={{ background: "var(--red-l)", color: "var(--red)", padding: "10px 12px", borderRadius: 10, fontSize: 13 }}>
              {error}
            </div>
          )}

          <div className="form-group">
            <label className="form-label" htmlFor="correo">Correo</label>
            <input
              id="correo"
              className="form-input"
              type="email"
              placeholder="tucorreo@said.edu"
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
              placeholder="••••••••"
              value={contrasena}
              onChange={(e) => setContrasena(e.target.value)}
              required
              minLength={6}
            />
          </div>

          <button className="btn btn-primary" type="submit" disabled={enviando}>
            {enviando ? "Ingresando..." : "Ingresar"}
          </button>

          <div className="divider">o</div>

          <div className="auth-link">
            ¿No tienes cuenta? <Link to="/register"><span>Regístrate</span></Link>
          </div>
        </form>
      </div>
    </div>
  );
}
