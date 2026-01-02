package com.siamcode.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.RestController;

@SpringBootApplication

@RestController
public class HelloAplication {

    public static void main(String[] args) {
        SpringApplication.run(HelloAplication.class, args);
    }

}
