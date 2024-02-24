package com.alirizaaynaci.portfolio.model;

import jakarta.persistence.*;
import org.hibernate.annotations.GenericGenerator;

@Entity
@Table(name = "experiences")
public class Experience {

    @Id
    @Column(name = "ID")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "Company")
    private String companyName;

    @Column(name = "Position")
    private String position;

    public Experience(String companyName, String position) {
        this.companyName = companyName;
        this.position = position;
    }
    public Experience() {
        // No Args Constructor
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getCompanyName() {
        return companyName;
    }

    public void setCompanyName(String companyName) {
        this.companyName = companyName;
    }

    public String getPosition() {
        return position;
    }

    public void setPosition(String position) {
        this.position = position;
    }

    @Override
    public String toString() {
        return "Experience{" +
                "id=" + id +
                ", companyName='" + companyName + '\'' +
                ", position='" + position + '\'' +
                '}';
    }
}
