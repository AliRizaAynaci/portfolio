package com.alirizaaynaci.portfolio.repository;

import com.alirizaaynaci.portfolio.model.Post;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PostRepository extends JpaRepository<Post, Long> {

}
