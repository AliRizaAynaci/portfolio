package com.alirizaaynaci.portfolio.controller;

import com.alirizaaynaci.portfolio.model.Post;
import com.alirizaaynaci.portfolio.service.AuthenticationService;
import com.alirizaaynaci.portfolio.service.CommonService;
import com.alirizaaynaci.portfolio.service.PostService;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;


@Controller
public class LogoutController {

    private final AuthenticationService authenticationService;
    private final PostService postService;
    private final CommonService commonService;

    public LogoutController(AuthenticationService authenticationService, PostService postService, CommonService commonService) {
        this.authenticationService = authenticationService;
        this.postService = postService;
        this.commonService = commonService;
    }

    @GetMapping("/logout")
    public String logout(Model model) {
        authenticationService.setAdminExists(false);
        model.addAttribute("adminExists", authenticationService.getAdminExists());
        commonService.prepareModel(model);
        return "index";

    }
}
