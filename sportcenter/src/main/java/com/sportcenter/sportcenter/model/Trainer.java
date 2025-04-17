package com.sportcenter.sportcenter.model;
import jakarta.persistence.*;

@Entity
public class Trainer {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String specialty;
    private String bio;
    
}
