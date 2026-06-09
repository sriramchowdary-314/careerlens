package com.jobtrackr.dto.response;

public record AuthResponse(
        String accessToken,
        String refreshToken,
        String tokenType,
        UserInfo user
) {
    public record UserInfo(
            Long id,
            String email,
            String firstName,
            String lastName
    ) {
    }
}
