package main

import (
	"log"
	"net/http"
)

func (cfg *apiConfig) HandleReset(w http.ResponseWriter, r *http.Request) {
	if cfg.platform != "dev" {
		w.WriteHeader(http.StatusForbidden)
		w.Write([]byte("Reset is only allowed in dev platform"))
		return
	}

	PurgeUsersErr := cfg.db.PurgeUsers(r.Context())
	if PurgeUsersErr != nil {
		log.Printf("Error purging users: %s", PurgeUsersErr)
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte("Error purging users"))
		return
	}

	w.WriteHeader(http.StatusOK)
	w.Write([]byte("OK"))
}
