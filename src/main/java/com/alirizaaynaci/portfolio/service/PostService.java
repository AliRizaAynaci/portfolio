package com.alirizaaynaci.portfolio.service;

import com.alirizaaynaci.portfolio.model.Post;
import com.alirizaaynaci.portfolio.repository.PostRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;

@Service
public class PostService {

    private final PostRepository postRepository;

    public PostService(PostRepository postRepository) {
        this.postRepository = postRepository;
    }

    public List<Post> getAllPost() {
        return postRepository.findAll();
    }

    public Optional<Post> getPostById(Long postId) {
        return postRepository.findById(postId);
    }

    public Post createPost(Post post) {
        post.setCreationDate(formatDate(LocalDateTime.now()));
        return postRepository.save(post);
    }

    public Optional<Post> updatePost(Long postId, Post updatePost) {
        Optional<Post> existingPost = postRepository.findById(postId);
        if (existingPost.isPresent()) {
            Post postToUpdate = existingPost.get();
            postToUpdate.setTitle(updatePost.getTitle());
            postToUpdate.setContent(updatePost.getContent());
            return Optional.of(postRepository.save(postToUpdate));
        }
        else {
            return Optional.empty();
        }
    }

    public boolean deletePost(Long postId) {
        Optional<Post> existingPost = postRepository.findById(postId);
        if(existingPost.isPresent()) {
            postRepository.deleteById(postId);
            return true;
        }
        else {
            return false;
        }
    }

    private String formatDate(LocalDateTime dateTime) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("d MMMM yyyy HH:mm:ss");
        return dateTime.format(formatter);
    }
}
