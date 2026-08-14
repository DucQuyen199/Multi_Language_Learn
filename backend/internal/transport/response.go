package transport

import (
	"encoding/json"
	"net/http"
)

type envelope struct {
	Success bool      `json:"success"`
	Data    any       `json:"data"`
	Message *string   `json:"message"`
	Error   *apiError `json:"error,omitempty"`
}

type apiError struct {
	Code    string `json:"code"`
	Message string `json:"message"`
}

func WriteJSON(w http.ResponseWriter, status int, data any) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(envelope{Success: status < http.StatusBadRequest, Data: data, Message: nil})
}

func WriteError(w http.ResponseWriter, status int, code, message string) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(envelope{Success: false, Data: nil, Message: nil, Error: &apiError{Code: code, Message: message}})
}
