package com.rhzs.erp.manage.module.sys.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RequestMapping
@Controller
public class TestController {

    @RequestMapping("/user")
    public String getUser(){
         return  "index";
    }



    @RequestMapping("/user1")
    public String getpage(){
        return  "index1";
    }
}
