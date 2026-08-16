package com.healthtrack.service;
import com.healthtrack.entity.User;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import java.util.logging.Logger;
@Service
public class EmailService {
    private static final Logger log=Logger.getLogger(EmailService.class.getName());
    @Async public void sendOtpEmail(String to,String otp){log.info("OTP for "+to+": "+otp);}
    @Async public void sendCriticalAlertEmail(User p,String msg){log.warning("CRITICAL ALERT "+p.getFirstName()+" "+p.getLastName()+": "+msg);}
}