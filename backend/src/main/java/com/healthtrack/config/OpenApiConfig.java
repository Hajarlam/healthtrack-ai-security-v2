package com.healthtrack.config;
import io.swagger.v3.oas.annotations.*;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeType;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.security.SecurityScheme;
import org.springframework.context.annotation.Configuration;
@Configuration
@OpenAPIDefinition(info=@Info(title="Sihati API",version="1.0",description="API REST — Sihati"))
@SecurityScheme(name="bearerAuth",type=SecuritySchemeType.HTTP,bearerFormat="JWT",scheme="bearer")
public class OpenApiConfig {}
