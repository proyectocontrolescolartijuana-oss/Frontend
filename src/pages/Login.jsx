import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { loginRequest } from "../services/authService";
import { useAuth } from "../context/authStore";
import { useNavigate } from "react-router-dom";
import { consumeSessionExpiredMessage } from "../services/session";
import unifrontLogo from "../assets/UnifrontLogoAzul.png";

const getDefaultPath = (user) => {
  const roles = user?.roles?.map((role) => role.nombre) || [];
  const isOnlyAlumno =
    roles.includes("ALUMNO") && roles.every((role) => role === "ALUMNO");

  return isOnlyAlumno ? "/alumno/boleta-final" : "/dashboard";
};

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState(() => consumeSessionExpiredMessage());
  const [loading, setLoading] = useState(false);
  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setNotice("");

    try {
      setLoading(true);

      const data = await loginRequest(email, password);

      login(data.access_token, data.user);

      navigate(getDefaultPath(data.user));
    } catch (err) {
      console.error(err);

      setError("Correo o contraseña incorrectos");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl border p-8">
        <div className="flex flex-col items-center mb-8">
          <img
            src={unifrontLogo}
            alt="Unifront Educacion sin fronteras"
            className="h-20 w-auto object-contain"
          />

          <h1 className="sr-only">Unifront</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="text-sm font-medium">Correo</label>

            <input
              type="email"
              placeholder="correo@unifront.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-2 w-full rounded-xl border px-4 py-3 outline-none focus:ring-2 focus:ring-[var(--accent)]"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Contraseña</label>

            <div className="relative mt-2">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border px-4 py-3 pr-12 outline-none focus:ring-2 focus:ring-[var(--accent)]"
              />

              <button
                type="button"
                aria-label={
                  showPassword ? "Ocultar contrasena" : "Mostrar contrasena"
                }
                aria-pressed={showPassword}
                onClick={() => setShowPassword((current) => !current)}
                className="absolute inset-y-0 right-0 flex items-center px-4 text-gray-500 transition hover:text-[var(--primary)]"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {notice && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
              {notice}
            </div>
          )}

          {error && <div className="text-red-500 text-sm">{error}</div>}

          <button
            disabled={loading}
            className="w-full rounded-xl bg-[var(--primary)] py-3 text-white font-medium hover:opacity-90 transition disabled:opacity-50"
          >
            {loading ? "Iniciando sesión..." : "Iniciar sesión"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
