package com.officely.backend.api.auth;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class CheckResetCodeResponse {
    private boolean valid;
}
