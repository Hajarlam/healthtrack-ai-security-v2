package com.healthtrack.service;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
@Service
public class WebSocketService {
    private final SimpMessagingTemplate tpl;
    public WebSocketService(SimpMessagingTemplate t){tpl=t;}
    public void sendHealthUpdate(Long pid,Object d){tpl.convertAndSend("/topic/health/"+pid,d);}
    public void sendAlert(Long uid,Object a){tpl.convertAndSend("/topic/alerts/"+uid,a);}
}