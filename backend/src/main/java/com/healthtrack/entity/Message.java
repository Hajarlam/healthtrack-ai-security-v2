package com.healthtrack.entity;
import jakarta.persistence.*;
import java.time.LocalDateTime;
@Entity @Table(name="messages")
public class Message {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch=FetchType.EAGER) @JoinColumn(name="sender_id",nullable=false) private User sender;
    @ManyToOne(fetch=FetchType.EAGER) @JoinColumn(name="receiver_id",nullable=false) private User receiver;
    @Column(columnDefinition="TEXT") private String content;
    private boolean read=false;
    private LocalDateTime sentAt;
    @PrePersist protected void onCreate(){sentAt=LocalDateTime.now();}
    public Long getId(){return id;}
    public User getSender(){return sender;} public void setSender(User v){sender=v;}
    public User getReceiver(){return receiver;} public void setReceiver(User v){receiver=v;}
    public String getContent(){return content;} public void setContent(String v){content=v;}
    public boolean isRead(){return read;} public void setRead(boolean v){read=v;}
    public LocalDateTime getSentAt(){return sentAt;}
}
