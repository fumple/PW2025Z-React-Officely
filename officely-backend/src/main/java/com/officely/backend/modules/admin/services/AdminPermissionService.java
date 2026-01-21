package com.officely.backend.modules.admin.services;

import com.officely.backend.entity.UserEntity;
import org.springframework.stereotype.Service;

@Service
public class AdminPermissionService {
    public boolean canViewUser(UserEntity actor, UserEntity targetUser) {
        if(actor.isAdmin())
            return true;
        if(actor.getId().equals(targetUser.getId()))
            return true;
        // TODO: Real permission check
        return true;
    }
    public boolean canUpdateUser(UserEntity actor, UserEntity targetUser) {
        if(actor.isAdmin())
            return true;
        if(actor.getId().equals(targetUser.getId()))
            return true;
        return false;
    }
    public boolean canBlockUser(UserEntity actor, UserEntity targetUser) {
        if(actor.isAdmin())
            return true;
        return false;
    }
}
