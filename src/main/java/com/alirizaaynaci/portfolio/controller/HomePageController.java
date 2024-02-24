package com.alirizaaynaci.portfolio.controller;

import com.alirizaaynaci.portfolio.service.AuthenticationService;
import com.alirizaaynaci.portfolio.service.CommonService;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/")
public class HomePageController {

    private final AuthenticationService authenticationService;
    private final CommonService commonService;

    public HomePageController(AuthenticationService authenticationService, CommonService commonService) {
        this.authenticationService = authenticationService;
        this.commonService = commonService;
    }

    @GetMapping("/home")
    public String index(Model model) {
        commonService.prepareModel(model);
        return "index";
    }

    @GetMapping("/admin-home")
    public String home(Model model) {
        authenticationService.setAdminExists(true);
        commonService.prepareModel(model);
        return "index";
    }

}
