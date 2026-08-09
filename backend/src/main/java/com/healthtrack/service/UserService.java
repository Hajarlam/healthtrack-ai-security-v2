package com.healthtrack.service;
import com.healthtrack.dto.UserDTO;
import com.healthtrack.entity.User;
import com.healthtrack.repository.UserRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List; import java.util.stream.Collectors;
@Service
public class UserService {
    private final UserRepository ur;
    public UserService(UserRepository u){ur=u;}
    public User getCurrentUser(){String email=SecurityContextHolder.getContext().getAuthentication().getName();return ur.findByEmail(email).orElseThrow(()->new RuntimeException("User not found"));}
    public UserDTO getUserById(Long id){return ur.findById(id).map(UserDTO::from).orElseThrow(()->new RuntimeException("User not found"));}
    public List<UserDTO> getAllDoctors(){return ur.findActiveDoctors().stream().map(UserDTO::from).collect(Collectors.toList());}
    public List<UserDTO> getAllPatients(){return ur.findActivePatients().stream().map(UserDTO::from).collect(Collectors.toList());}
    public List<UserDTO> getAllUsers(){return ur.findAll().stream().map(UserDTO::from).collect(Collectors.toList());}
    @Transactional
    public void toggleUserStatus(Long id){
        User u=ur.findById(id).orElseThrow(()->new RuntimeException("User not found"));
        u.setEnabled(!u.isEnabled());
        ur.save(u);
    }
    @Transactional
    public UserDTO updateProfile(Long uid,UserDTO dto){
        User u=ur.findById(uid).orElseThrow(()->new RuntimeException("Not found"));
        if(dto.getFirstName()!=null)u.setFirstName(dto.getFirstName());
        if(dto.getLastName()!=null)u.setLastName(dto.getLastName());
        if(dto.getPhone()!=null)u.setPhone(dto.getPhone());
        if(dto.getGender()!=null)u.setGender(dto.getGender());
        if(dto.getDateOfBirth()!=null)u.setDateOfBirth(dto.getDateOfBirth());
        if(dto.getBloodType()!=null)u.setBloodType(dto.getBloodType());
        if(dto.getHeight()!=null)u.setHeight(dto.getHeight());
        if(dto.getWeight()!=null)u.setWeight(dto.getWeight());
        return UserDTO.from(ur.save(u));
    }
}