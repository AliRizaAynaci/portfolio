package com.alirizaaynaci.portfolio.controller;

import com.alirizaaynaci.portfolio.model.Education;
import com.alirizaaynaci.portfolio.model.Post;
import com.alirizaaynaci.portfolio.service.AuthenticationService;
import com.alirizaaynaci.portfolio.service.CommonService;
import com.alirizaaynaci.portfolio.service.PostService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@Controller
public class PostController {

    private final PostService postService;
    private final AuthenticationService authenticationService;
    private final CommonService commonService;

    public PostController(PostService postService, AuthenticationService authenticationService,
                          CommonService commonService) {
        this.postService = postService;
        this.authenticationService = authenticationService;
        this.commonService = commonService;
    }


    @GetMapping("/")
    public String home(Model model) {
        commonService.prepareModel(model);
        return "index";
    }

    @GetMapping("/posts/{postId}")
    public String getPostById(@PathVariable Long postId, Model model) {
        Optional<Post> posts = postService.getPostById(postId);
        posts.ifPresent(post -> model.addAttribute("post", post));
        if (authenticationService.getAdminExists()) {
            model.addAttribute("adminExists", authenticationService.getAdminExists());
        }
        return "post-details";
    }

    @GetMapping("/admin-posts/{postId}")
    public String getPostByIdForAdmin(@PathVariable Long postId, Model model) {
        Optional<Post> posts = postService.getPostById(postId);
        posts.ifPresent(post -> model.addAttribute("post", posts));
        if (authenticationService.getAdminExists()) {
            model.addAttribute("adminExists", authenticationService.getAdminExists());
        }
        return "admin-post-details";
    }

    @GetMapping("/admin/create-post")
    public String createPostForm(Model model) {
        if (authenticationService.getAdminExists()) {
            model.addAttribute("adminExists", authenticationService.getAdminExists());
            model.addAttribute("post", new Post());
            return "createPost";
        }
        return "redirect:/";
    }

    @PostMapping("/admin/add-post")
    public String createPost(@ModelAttribute Post post, Model model) {
        postService.createPost(post);
        if (authenticationService.getAdminExists()) {
            model.addAttribute("adminExists", authenticationService.getAdminExists());
            return "redirect:/admin-home";
        }
        return "redirect:/";
    }

}
