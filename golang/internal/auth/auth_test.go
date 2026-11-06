package auth

import (
	"testing"
	"time"
	"github.com/google/uuid"
)

func TestHashPassword(t *testing.T) {
    name := "Gladys"
    hash, err := HashPassword(name)
    if err != nil {
        t.Fatalf("HashPassword(%q) returned an error: %v", name, err)
    }
    match, err := CheckPasswordHash(name, hash)
    if err != nil {
        t.Fatalf("CheckPasswordHash(%q, %q) returned an error: %v", name, hash, err)
    }
    if !match {
        t.Errorf("CheckPasswordHash(%q, %q) = false, want true", name, hash)
    }
}

func TestMakeJWT(t *testing.T) {
	userID := "123e4567-e89b-12d3-a456-426614174000"
	tokenSecret := "mysecret"
	expiresIn := 3600 // 1 hour

	token, err := MakeJWT(uuid.MustParse(userID), tokenSecret, time.Duration(expiresIn)*time.Second)
	if err != nil {
		t.Fatalf("MakeJWT returned an error: %v", err)
	}

	// Validate the token
	parsedUserID, err := ValidateJWT(token, tokenSecret)
	if err != nil {
		t.Fatalf("ValidateJWT returned an error: %v", err)
	}

	if parsedUserID.String() != userID {
		t.Errorf("ValidateJWT returned userID %q, want %q", parsedUserID.String(), userID)
	}
}
