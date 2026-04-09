package com.autociclo.api;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;

/**
 * Cliente HTTP centralizado para comunicarse con la API REST de AutoCiclo.
 * Gestiona automáticamente el token JWT en cada petición.
 *
 * @author Yalil Musa Talhaoui
 */
public class ApiClient {

    private static ApiClient instancia;

    private final HttpClient httpClient;
    private final Gson gson;
    private static final String BASE_URL = "http://localhost:8080";

    private ApiClient() {
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(10))
                .build();
        this.gson = new GsonBuilder().setPrettyPrinting().create();
    }

    public static synchronized ApiClient getInstance() {
        if (instancia == null) {
            instancia = new ApiClient();
        }
        return instancia;
    }

    // ─────────────────────────────────────────────
    //  Métodos públicos: GET / POST / PUT / DELETE
    // ─────────────────────────────────────────────

    public ApiResponse get(String endpoint) {
        try {
            HttpRequest request = buildRequest(endpoint)
                    .GET()
                    .build();
            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            return new ApiResponse(response.statusCode(), response.body());
        } catch (Exception e) {
            return new ApiResponse(0, "{\"error\":\"" + e.getMessage() + "\"}");
        }
    }

    public ApiResponse post(String endpoint, Object body) {
        try {
            String json = gson.toJson(body);
            HttpRequest request = buildRequest(endpoint)
                    .POST(HttpRequest.BodyPublishers.ofString(json))
                    .build();
            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            return new ApiResponse(response.statusCode(), response.body());
        } catch (Exception e) {
            return new ApiResponse(0, "{\"error\":\"" + e.getMessage() + "\"}");
        }
    }

    public ApiResponse put(String endpoint, Object body) {
        try {
            String json = (body != null) ? gson.toJson(body) : "{}";
            HttpRequest request = buildRequest(endpoint)
                    .PUT(HttpRequest.BodyPublishers.ofString(json))
                    .build();
            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            return new ApiResponse(response.statusCode(), response.body());
        } catch (Exception e) {
            return new ApiResponse(0, "{\"error\":\"" + e.getMessage() + "\"}");
        }
    }

    public ApiResponse delete(String endpoint) {
        try {
            HttpRequest request = buildRequest(endpoint)
                    .DELETE()
                    .build();
            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            return new ApiResponse(response.statusCode(), response.body());
        } catch (Exception e) {
            return new ApiResponse(0, "{\"error\":\"" + e.getMessage() + "\"}");
        }
    }

    // ─────────────────────────────────────────────
    //  Builder interno con JWT automático
    // ─────────────────────────────────────────────

    private HttpRequest.Builder buildRequest(String endpoint) {
        HttpRequest.Builder builder = HttpRequest.newBuilder()
                .uri(URI.create(BASE_URL + endpoint))
                .timeout(Duration.ofSeconds(15))
                .header("Content-Type", "application/json")
                .header("Accept", "application/json");

        String token = SessionManager.getInstance().getToken();
        if (token != null && !token.isEmpty()) {
            builder.header("Authorization", "Bearer " + token);
        }
        return builder;
    }

    public Gson getGson() {
        return gson;
    }

    // ─────────────────────────────────────────────
    //  Clase de respuesta simple
    // ─────────────────────────────────────────────

    public static class ApiResponse {
        private final int statusCode;
        private final String body;

        public ApiResponse(int statusCode, String body) {
            this.statusCode = statusCode;
            this.body = body;
        }

        public int getStatusCode() { return statusCode; }
        public String getBody() { return body; }
        public boolean isSuccess() { return statusCode >= 200 && statusCode < 300; }
    }
}
