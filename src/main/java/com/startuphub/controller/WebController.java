package com.startuphub.controller;

import org.springframework.ui.Model;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@Controller
public class WebController {

    @GetMapping("/")
    public String index() {
        return "index";
    }

    @GetMapping("/app/feed")
    public String feed() {
        return "feed";
    }

    @GetMapping("/app/discovery")
    public String discovery() {
        return "discovery";
    }

    @GetMapping("/app/profile")
    public String profile() {
        return "profile";
    }

    @GetMapping("/app/startups")
    public String startups() {
        return "startups";
    }

    @GetMapping("/app/startups/{startupId}")
    public String startupDetail(@PathVariable Long startupId, Model model) {
        model.addAttribute("startupId", startupId);
        return "startup-detail";
    }

    @GetMapping("/app/notifications")
    public String notifications() {
        return "notifications";
    }

    @GetMapping("/app/messages")
    public String messages() {
        return "messages";
    }
}
