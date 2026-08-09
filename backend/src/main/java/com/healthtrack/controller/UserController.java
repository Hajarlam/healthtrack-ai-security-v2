package com.healthtrack.controller;
import com.healthtrack.dto.UserDTO; import com.healthtrack.service.UserService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement; import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity; import org.springframework.web.bind.annotation.*;
import java.util.List;
@RestController @RequestMapping("/users") @Tag(name="Users") @SecurityRequirement(name="bearerAuth")
public class UserController {
    private final UserService s;
    public UserController(UserService s){this.s=s;}
    @GetMapping("/me")       public ResponseEntity<UserDTO>       getMe(){return ResponseEntity.ok(UserDTO.from(s.getCurrentUser()));}
    @PutMapping("/me")       public ResponseEntity<UserDTO>       updateMe(@RequestBody UserDTO d){return ResponseEntity.ok(s.updateProfile(s.getCurrentUser().getId(),d));}
    @GetMapping("/{id}")     public ResponseEntity<UserDTO>       getById(@PathVariable Long id){return ResponseEntity.ok(s.getUserById(id));}
    @GetMapping("/doctors")  public ResponseEntity<List<UserDTO>> getDoctors(){return ResponseEntity.ok(s.getAllDoctors());}
    @GetMapping("/patients") public ResponseEntity<List<UserDTO>> getPatients(){return ResponseEntity.ok(s.getAllPatients());}
    @GetMapping              public ResponseEntity<List<UserDTO>> getAll(){return ResponseEntity.ok(s.getAllUsers());}
    @PatchMapping("/{id}/toggle-status")
    public ResponseEntity<Void> toggleStatus(@PathVariable Long id){s.toggleUserStatus(id);return ResponseEntity.ok().build();}
}