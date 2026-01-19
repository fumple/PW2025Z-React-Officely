package com.officely.backend.api.pagination;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PaginationDto {
    private int currentPage;
    private int lastPage;
    private int pageSize;
}
