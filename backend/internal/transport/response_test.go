package transport

import (
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
)

func TestWriteErrorUsesStableEnvelope(t *testing.T) {
	recorder := httptest.NewRecorder()
	WriteError(recorder, http.StatusBadRequest, "VALIDATION_ERROR", "Invalid request")
	body := recorder.Body.String()
	if !strings.Contains(body, `"success":false`) || !strings.Contains(body, `"code":"VALIDATION_ERROR"`) {
		t.Fatalf("unexpected error envelope: %s", body)
	}
}
