package com.officely.backend.controller;

import com.officely.backend.api.Office;
import com.officely.backend.service.OfficeService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;

@RestController
@RequestMapping("/offices")
public class OfficesController {
    private final OfficeService officeService;

    public OfficesController(OfficeService officeService){
        this.officeService = officeService;
    }

    @GetMapping
    public List<Office> listOffices(
            @RequestParam(required = false) String nearAddress,
            @RequestParam(required = false) Integer maxDistanceFromAddress,
            @RequestParam(required = false) List<String> filter,
            @RequestParam(required = false) String sort,
            @RequestParam(required = false, defaultValue = "10") Integer pageSize,
            @RequestParam(required = false) String pageToken
    ){
        return officeService.listOffices(nearAddress, maxDistanceFromAddress, filter, sort, pageSize, pageToken);
    }
}
