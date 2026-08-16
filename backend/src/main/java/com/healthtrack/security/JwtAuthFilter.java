package com.healthtrack.security;
import jakarta.servlet.*; import jakarta.servlet.http.*;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.*;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;
@Component
public class JwtAuthFilter extends OncePerRequestFilter {
    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;
    public JwtAuthFilter(JwtService j,UserDetailsService u){jwtService=j;userDetailsService=u;}
    @Override protected void doFilterInternal(@NonNull HttpServletRequest req,@NonNull HttpServletResponse res,@NonNull FilterChain chain) throws ServletException,IOException {
        String auth=req.getHeader("Authorization");
        if(auth==null||!auth.startsWith("Bearer ")){chain.doFilter(req,res);return;}
        try{
            String jwt=auth.substring(7),email=jwtService.extractUsername(jwt);
            if(email!=null&&SecurityContextHolder.getContext().getAuthentication()==null){
                UserDetails ud=userDetailsService.loadUserByUsername(email);
                if(jwtService.isTokenValid(jwt,ud)){
                    var t=new UsernamePasswordAuthenticationToken(ud,null,ud.getAuthorities());
                    t.setDetails(new WebAuthenticationDetailsSource().buildDetails(req));
                    SecurityContextHolder.getContext().setAuthentication(t);
                }
            }
        }catch(Exception ignored){}
        chain.doFilter(req,res);
    }
}
