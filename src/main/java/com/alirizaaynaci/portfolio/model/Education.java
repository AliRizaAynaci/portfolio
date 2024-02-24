package com.alirizaaynaci.portfolio.model;

import jakarta.persistence.*;
import org.hibernate.annotations.GenericGenerator;

@Entity
@Table(name = "educations")
public class Education {

    @Id
    @Column(name = "ID")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String institution;
    private String degree;
    private String department;

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    public Education(String institution, String degree, String department) {
        this.institution = institution;
        this.degree = degree;
        this.department = department;
    }

    public Education() {
        // No Args Constructor
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getInstitution() {
        return institution;
    }

    public void setInstitution(String institution) {
        this.institution = institution;
    }

    public String getDegree() {
        return degree;
    }

    public void setDegree(String degree) {
        this.degree = degree;
    }

    @Override
    public String toString() {
        return "Experience{" +
                "id=" + id +
                ", institution='" + institution + '\'' +
                ", degree='" + degree + '\'' +
                '}';
    }
}
