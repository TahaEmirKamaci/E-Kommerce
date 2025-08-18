package com.ekommerce.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "user_roles")
public class UserRole {
    public static final String ADMIN = "ADMIN";
    public static final String CUSTOMER = "CUSTOMER";
    public static final String SELLER = "SELLER";

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // İsteğe bağlı: veritabanındaki satırın temsilî adı
    @Enumerated(EnumType.STRING)
    @Column(name = "role_type", unique = true, nullable = false)
    private RoleType roleType;

    public enum RoleType {
        ADMIN, CUSTOMER, SELLER
    }

    // getter/setter
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public RoleType getRoleType() { return roleType; }
    public void setRoleType(RoleType roleType) { this.roleType = roleType; }
        public static UserRole valueOf(String upperCase) {
            for (RoleType role : RoleType.values()) {
                if (role.name().equals(upperCase)) {
                    UserRole userRole = new UserRole();
                    userRole.setRoleType(role);
                    return userRole;
                }
            }
            throw new IllegalArgumentException("No enum constant " + UserRole.class.getCanonicalName() + "." + upperCase);
        }
}