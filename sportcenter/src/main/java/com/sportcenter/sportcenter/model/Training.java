package com.sportcenter.sportcenter.model;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
public class Training {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private LocalDateTime dateTime;

    @ManyToOne
    private Trainer trainer;
    
}
