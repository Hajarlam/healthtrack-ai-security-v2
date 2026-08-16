package com.healthtrack.security;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import javax.crypto.SecretKey;
import java.util.*; import java.util.function.Function;
@Service
public class JwtService {
    @Value("${jwt.secret}") private String secretKey;
    @Value("${jwt.expiration}") private long jwtExpiration;
    @Value("${jwt.refresh-expiration}") private long refreshExpiration;
    public String extractUsername(String token){return extractClaim(token,Claims::getSubject);}
    public <T> T extractClaim(String token,Function<Claims,T> resolver){
        return resolver.apply(Jwts.parser().verifyWith(getKey()).build().parseSignedClaims(token).getPayload());
    }
    public String generateToken(UserDetails ud){
        return Jwts.builder().subject(ud.getUsername()).issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis()+jwtExpiration)).signWith(getKey()).compact();
    }
    public String generateRefreshToken(UserDetails ud){
        return Jwts.builder().subject(ud.getUsername()).issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis()+refreshExpiration)).signWith(getKey()).compact();
    }
    public boolean isTokenValid(String token,UserDetails ud){
        try{return extractUsername(token).equals(ud.getUsername())&&!extractClaim(token,Claims::getExpiration).before(new Date());}
        catch(Exception e){return false;}
    }
    private SecretKey getKey(){
        byte[] b=Base64.getDecoder().decode(Base64.getEncoder().encodeToString(secretKey.getBytes()));
        return Keys.hmacShaKeyFor(b);
    }
}
