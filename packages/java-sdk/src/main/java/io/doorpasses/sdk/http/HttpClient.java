package io.doorpasses.sdk.http;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import io.doorpasses.sdk.auth.Auth;
import okhttp3.*;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.TimeUnit;

/**
 * HTTP client for making authenticated requests to the DoorPasses API.
 */
public class HttpClient {
    private static final MediaType JSON = MediaType.get("application/json; charset=utf-8");
    private static final ObjectMapper objectMapper = new ObjectMapper()
            .registerModule(new JavaTimeModule());

    private final OkHttpClient client;
    private final String accountId;
    private final String sharedSecret;
    private final String baseUrl;

    /**
     * Creates a new HttpClient instance.
     *
     * @param accountId The account ID
     * @param sharedSecret The shared secret
     * @param baseUrl The base URL for the API
     * @param timeout The request timeout in milliseconds
     */
    public HttpClient(String accountId, String sharedSecret, String baseUrl, long timeout) {
        this.accountId = accountId;
        this.sharedSecret = sharedSecret;
        this.baseUrl = baseUrl;

        this.client = new OkHttpClient.Builder()
                .connectTimeout(timeout, TimeUnit.MILLISECONDS)
                .readTimeout(timeout, TimeUnit.MILLISECONDS)
                .writeTimeout(timeout, TimeUnit.MILLISECONDS)
                .build();
    }

    /**
     * Makes a GET request.
     *
     * @param url The URL path
     * @param sigPayload Optional signature payload
     * @param responseType The response type class
     * @return The response object
     */
    public <T> T get(String url, Map<String, Object> sigPayload, Class<T> responseType) throws IOException {
        Auth.AuthHeadersResult authHeaders = Auth.createGetAuthHeaders(accountId, sharedSecret, sigPayload);

        HttpUrl.Builder urlBuilder = HttpUrl.parse(baseUrl + url).newBuilder();
        urlBuilder.addQueryParameter("sig_payload", authHeaders.getSigPayload());

        Request.Builder requestBuilder = new Request.Builder()
                .url(urlBuilder.build())
                .get();

        for (Map.Entry<String, String> header : authHeaders.getHeaders().entrySet()) {
            requestBuilder.addHeader(header.getKey(), header.getValue());
        }

        return executeRequest(requestBuilder.build(), responseType);
    }

    /**
     * Makes a POST request.
     *
     * @param url The URL path
     * @param payload The request payload
     * @param responseType The response type class
     * @return The response object
     */
    public <T> T post(String url, Object payload, Class<T> responseType) throws IOException {
        Map<String, String> headers = Auth.createAuthHeaders(accountId, sharedSecret, payload);

        RequestBody body = payload != null
                ? RequestBody.create(objectMapper.writeValueAsString(payload), JSON)
                : RequestBody.create("", JSON);

        Request.Builder requestBuilder = new Request.Builder()
                .url(baseUrl + url)
                .post(body);

        for (Map.Entry<String, String> header : headers.entrySet()) {
            requestBuilder.addHeader(header.getKey(), header.getValue());
        }

        return executeRequest(requestBuilder.build(), responseType);
    }

    /**
     * Makes a PATCH request.
     *
     * @param url The URL path
     * @param payload The request payload
     * @param responseType The response type class
     * @return The response object
     */
    public <T> T patch(String url, Object payload, Class<T> responseType) throws IOException {
        Map<String, String> headers = Auth.createAuthHeaders(accountId, sharedSecret, payload);

        RequestBody body = RequestBody.create(objectMapper.writeValueAsString(payload), JSON);

        Request.Builder requestBuilder = new Request.Builder()
                .url(baseUrl + url)
                .patch(body);

        for (Map.Entry<String, String> header : headers.entrySet()) {
            requestBuilder.addHeader(header.getKey(), header.getValue());
        }

        return executeRequest(requestBuilder.build(), responseType);
    }

    /**
     * Makes a DELETE request.
     *
     * @param url The URL path
     * @param responseType The response type class
     * @return The response object
     */
    public <T> T delete(String url, Class<T> responseType) throws IOException {
        Map<String, String> headers = Auth.createAuthHeaders(accountId, sharedSecret, null);

        Request.Builder requestBuilder = new Request.Builder()
                .url(baseUrl + url)
                .delete();

        for (Map.Entry<String, String> header : headers.entrySet()) {
            requestBuilder.addHeader(header.getKey(), header.getValue());
        }

        return executeRequest(requestBuilder.build(), responseType);
    }

    /**
     * Executes a request and handles the response.
     *
     * @param request The HTTP request
     * @param responseType The response type class
     * @return The response object
     */
    private <T> T executeRequest(Request request, Class<T> responseType) throws IOException {
        try (Response response = client.newCall(request).execute()) {
            if (!response.isSuccessful()) {
                String errorBody = response.body() != null ? response.body().string() : "";
                String errorMessage;

                try {
                    JsonNode errorNode = objectMapper.readTree(errorBody);
                    errorMessage = errorNode.has("error") ? errorNode.get("error").asText()
                            : errorNode.has("message") ? errorNode.get("message").asText()
                            : "Unknown error";
                } catch (Exception e) {
                    errorMessage = errorBody.isEmpty() ? "Unknown error" : errorBody;
                }

                throw new IOException("DoorPasses API Error (" + response.code() + "): " + errorMessage);
            }

            String responseBody = response.body().string();
            JsonNode jsonNode = objectMapper.readTree(responseBody);

            // Extract data field if present, otherwise use the entire response
            JsonNode dataNode = jsonNode.has("data") ? jsonNode.get("data") : jsonNode;

            return objectMapper.treeToValue(dataNode, responseType);
        }
    }
}
