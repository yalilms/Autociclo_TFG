package com.autociclo.api;

/**
 * Almacena la sesión activa del usuario logueado (token JWT, nombre, email, rol).
 * Singleton accesible desde cualquier controlador del Desktop.
 *
 * @author Yalil Musa Talhaoui
 */
public class SessionManager {

    private static SessionManager instancia;

    private String token;
    private String email;
    private String nombre;
    private String rol;

    private SessionManager() {}

    public static synchronized SessionManager getInstance() {
        if (instancia == null) {
            instancia = new SessionManager();
        }
        return instancia;
    }

    // ─── Getters ───────────────────────────────────

    public String getToken()  { return token; }
    public String getEmail()  { return email; }
    public String getNombre() { return nombre; }
    public String getRol()    { return rol; }

    public boolean isAdmin()    { return "ADMIN".equals(rol); }
    public boolean isEmpleado() { return "EMPLEADO".equals(rol); }
    public boolean isCliente()  { return "CLIENTE".equals(rol); }
    public boolean isLoggedIn() { return token != null && !token.isEmpty(); }

    // ─── Setters ───────────────────────────────────

    public void iniciarSesion(String token, String email, String nombre, String rol) {
        this.token  = token;
        this.email  = email;
        this.nombre = nombre;
        this.rol    = rol;
    }

    public void cerrarSesion() {
        this.token  = null;
        this.email  = null;
        this.nombre = null;
        this.rol    = null;
    }
}
