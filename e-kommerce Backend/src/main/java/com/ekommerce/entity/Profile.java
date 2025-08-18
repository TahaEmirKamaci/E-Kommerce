package com.ekommerce.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "profile")
public class Profile {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    private ProfileType type;

    public enum ProfileType { ADMIN, CUSTOMER, SELLER }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public ProfileType getType() { return type; }
    public void setType(ProfileType type) { this.type = type; }
}