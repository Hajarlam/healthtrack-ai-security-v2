package com.healthtrack.config;
import com.healthtrack.repository.UserRepository;
import org.springframework.context.annotation.*;
import org.springframework.security.authentication.*;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.core.userdetails.*;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
@Configuration
public class AppConfig {
    private final UserRepository userRepository;
    public AppConfig(UserRepository u){userRepository=u;}
    @Bean public UserDetailsService userDetailsService(){return email->userRepository.findByEmail(email).orElseThrow(()->new UsernameNotFoundException("Not found: "+email));}
    @Bean public AuthenticationProvider authenticationProvider(){var p=new DaoAuthenticationProvider();p.setUserDetailsService(userDetailsService());p.setPasswordEncoder(passwordEncoder());return p;}
    @Bean public AuthenticationManager authenticationManager(AuthenticationConfiguration c) throws Exception{return c.getAuthenticationManager();}
    @Bean public PasswordEncoder passwordEncoder(){return new BCryptPasswordEncoder();}
}
