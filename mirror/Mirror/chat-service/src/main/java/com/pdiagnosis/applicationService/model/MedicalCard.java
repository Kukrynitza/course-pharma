package com.pdiagnosis.applicationService.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UpdateTimestamp;

import java.util.Date;

@Table(name = "medical_cards", indexes = {
        @Index(name = "userId", columnList = "userid")})
@Entity
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Setter
@Getter
public class MedicalCard {
    @Column(name = "userid",nullable = false)
    private int userId;
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(nullable = false, unique = true, insertable = false, updatable = false)
    private int id;
    @Column(name = "diseas")
    private String diseas;
    @Column(name = "description")
    private String description;
    @Column(name = "possibility")
    private int possibility;
    @UpdateTimestamp
    @Column(nullable = false, insertable = false, updatable = false)
    private Date date_of_diagnosis;

    public String getFullDescription() {
        StringBuilder result = new StringBuilder();
        return result.append(diseas).append(" ").append(description).append(" ").append(possibility).append(" ").append(date_of_diagnosis).append("\n").toString();
    }
}
