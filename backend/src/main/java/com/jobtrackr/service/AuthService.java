package com.jobtrackr.service;

import com.jobtrackr.dto.request.LoginRequest;
import com.jobtrackr.dto.request.RefreshTokenRequest;
import com.jobtrackr.dto.request.RegisterRequest;
import com.jobtrackr.dto.response.AuthResponse;
import com.jobtrackr.entity.RefreshToken;
import com.jobtrackr.entity.User;
import com.jobtrackr.exception.UnauthorizedException;
import com.jobtrackr.repository.RefreshTokenRepository;
import com.jobtrackr.repository.UserRepository;
import com.jobtrackr.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;

    @Transactional
    public AuthResponse register(RegisterRequest req) {
        if (userRepository.existsByEmail(req.email())) {
            throw new IllegalArgumentException("Email already in use: " + req.email());
        }

        User user = User.builder()
                .email(req.email())
                .password(passwordEncoder.encode(req.password()))
                .firstName(req.firstName())
                .lastName(req.lastName())
                .build();

        user = userRepository.save(user);
        log.info("Registered new user: {}", user.getEmail());

        String accessToken = jwtUtil.generateAccessToken(user);
        String refreshTokenStr = jwtUtil.generateRefreshToken(user);

        saveRefreshToken(user, refreshTokenStr);

        return buildAuthResponse(accessToken, refreshTokenStr, user);
    }

    @Transactional
    public AuthResponse login(LoginRequest req) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(req.email(), req.password())
            );
        } catch (BadCredentialsException e) {
            throw new UnauthorizedException("Invalid email or password");
        }

        User user = userRepository.findByEmail(req.email())
                .orElseThrow(() -> new UnauthorizedException("User not found"));

        // Revoke all existing refresh tokens for this user
        refreshTokenRepository.deleteByUser(user);

        String accessToken = jwtUtil.generateAccessToken(user);
        String refreshTokenStr = jwtUtil.generateRefreshToken(user);

        saveRefreshToken(user, refreshTokenStr);

        log.info("User logged in: {}", user.getEmail());

        return buildAuthResponse(accessToken, refreshTokenStr, user);
    }

    @Transactional
    public AuthResponse refreshToken(RefreshTokenRequest req) {
        RefreshToken refreshToken = refreshTokenRepository.findByToken(req.refreshToken())
                .orElseThrow(() -> new UnauthorizedException("Refresh token not found"));

        if (refreshToken.isRevoked()) {
            throw new UnauthorizedException("Refresh token has been revoked");
        }

        if (refreshToken.getExpiryDate().isBefore(LocalDateTime.now())) {
            throw new UnauthorizedException("Refresh token has expired");
        }

        User user = refreshToken.getUser();
        String newAccessToken = jwtUtil.generateAccessToken(user);

        log.info("Refreshed access token for user: {}", user.getEmail());

        return buildAuthResponse(newAccessToken, req.refreshToken(), user);
    }

    @Transactional
    public void logout(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UnauthorizedException("User not found"));

        refreshTokenRepository.deleteByUser(user);
        log.info("User logged out: {}", email);
    }

    private void saveRefreshToken(User user, String tokenStr) {
        RefreshToken refreshToken = RefreshToken.builder()
                .token(tokenStr)
                .user(user)
                .expiryDate(LocalDateTime.now().plusSeconds(604800)) // 7 days
                .revoked(false)
                .build();
        refreshTokenRepository.save(refreshToken);
    }

    private AuthResponse buildAuthResponse(String accessToken, String refreshToken, User user) {
        AuthResponse.UserInfo userInfo = new AuthResponse.UserInfo(
                user.getId(),
                user.getEmail(),
                user.getFirstName(),
                user.getLastName()
        );
        return new AuthResponse(accessToken, refreshToken, "Bearer", userInfo);
    }
}
